import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Single Identifier Source
async function getIdentifierSource(uuid: string) {
  const res = await fetch(`${BASE_URL}/idgen/identifiersource`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch identifier source');
  return res.json();
}

// 🔹 Update Identifier Source
async function updateIdentifierSource(uuid: string, data: any) {
  const res = await fetch(`${BASE_URL}/idgen/identifiersource/${uuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to update');
  }
  return res.json();
}

export default function EditIdentifierSource() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    prefix: '',
    suffix: '',
    minLength: 3,
    maxLength: 20,
    baseCharacterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    skipAutomaticAssignment: false,
  });

  // Fixed fields (read-only)
  const checkDigitAlgorithm = 'MOD10';
  const regexFormat = '^[A-Z0-9]+$';

  // Load source data
  useEffect(() => {
    const load = async () => {
      if (!uuid) {
        toast.error('No identifier source selected');
        navigate('/pages/manage-identifier-sources');
        return;
      }

      try {
        const data = await getIdentifierSource(uuid);
        setForm({
          name: data.name || '',
          description: data.description || '',
          prefix: data.prefix || '',
          suffix: data.suffix || '',
          minLength: data.minLength || 3,
          maxLength: data.maxLength || 10,
          baseCharacterSet: data.baseCharacterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          skipAutomaticAssignment: data.retired || false,
        });
      } catch (err: any) {
        toast.error('Load failed: ' + (err.message || 'Not found'));
        navigate('/pages/manage-identifier-sources');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.baseCharacterSet.trim()) {
      toast.error('Base Character Set is required');
      return;
    }

    setSaving(true);
    try {
      await updateIdentifierSource(uuid!, {
        name: form.name,
        description: form.description,
        prefix: form.prefix,
        suffix: form.suffix,
        minLength: form.minLength,
        maxLength: form.maxLength,
        baseCharacterSet: form.baseCharacterSet,
        skipAutomaticAssignment: form.skipAutomaticAssignment,
        // Note: check digit & regex are not editable via API
      });
      toast.success('Identifier source updated successfully!');
      navigate('/pages/manage-identifier-sources');
    } catch (error: any) {
      toast.error('Save failed: ' + (error.message || 'Permission denied'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit: New Identifier for OpenMRS Identifier Number</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., MRN Source"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </div>

          {/* Check Digit Algorithm (Fixed) */}
          <div>
            <Label>Check Digit Algorithm</Label>
            <Input value={checkDigitAlgorithm} disabled className="bg-gray-100" />
            <p className="text-sm text-gray-500 mt-1">Fixed to MOD10 (Luhn algorithm)</p>
          </div>

          {/* Regular Expression Format (Fixed) */}
          <div>
            <Label>Regular Expression Format</Label>
            <Input value={regexFormat} disabled className="bg-gray-100" />
            <p className="text-sm text-gray-500 mt-1">Fixed format for validation</p>
          </div>

          {/* Base Character Set (Required) */}
          <div>
            <Label htmlFor="baseCharacterSet">Base Character Set *</Label>
            <Input
              id="baseCharacterSet"
              name="baseCharacterSet"
              value={form.baseCharacterSet}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Characters used to generate identifiers (e.g., A-Z, 0-9)
            </p>
          </div>

          {/* First Identifier Base (Fixed) */}
          <div>
            <Label>First Identifier Base</Label>
            <Input value="1" disabled className="bg-gray-100" />
            <p className="text-sm text-gray-500 mt-1">Sequential start value</p>
          </div>

          {/* Prefix */}
          <div>
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              name="prefix"
              value={form.prefix}
              onChange={handleChange}
              placeholder="e.g., MRN-"
            />
          </div>

          {/* Suffix */}
          <div>
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              name="suffix"
              value={form.suffix}
              onChange={handleChange}
              placeholder="e.g., -XYZ"
            />
          </div>

          {/* Min Length */}
          <div>
            <Label htmlFor="minLength">Min Length</Label>
            <Input
              id="minLength"
              name="minLength"
              type="number"
              value={form.minLength}
              onChange={handleChange}
              min="1"
            />
          </div>

          {/* Max Length */}
          <div>
            <Label htmlFor="maxLength">Max Length</Label>
            <Input
              id="maxLength"
              name="maxLength"
              type="number"
              value={form.maxLength}
              onChange={handleChange}
              min="1"
            />
          </div>

          {/* Skip Validation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="skipAutomaticAssignment"
              name="skipAutomaticAssignment"
              checked={form.skipAutomaticAssignment}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, skipAutomaticAssignment: !!checked }))
              }
            />
            <Label htmlFor="skipAutomaticAssignment">
              Skip validation during automatic assignment
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/patients/manage-identifier-sources')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
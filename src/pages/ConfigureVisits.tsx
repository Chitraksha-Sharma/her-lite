import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Mock data (will be fetched from API in real app)
const MOCK_VISIT_TYPES = [
  { uuid: '1', display: 'Outpatient' },
  { uuid: '2', display: 'Emergency' },
  { uuid: '3', display: 'Inpatient' },
];

const HANDLERS = [
  { value: 'org.openmrs.module.coreapps.AutomaticVisitAssignmentHandler', label: 'Automatic Visit Assignment Handler' },
  { value: 'org.openmrs.module.emrapi.encounter.EmrEncounterVisitAssignmentHandler', label: 'EMR Encounter Visit Handler' },
  { value: 'org.openmrs.module.coreapps.DefaultEncounterVisitAssignmentHandler', label: 'Default Handler' },
];

export default function ConfigureVisits() {
    const [loading, setLoading] = useState(true);
  
    // Form state
    const [form, setForm] = useState({
      enableVisits: true,
      autoCloseTask: false,
      visitTypesToAutoClose: [] as string[],
      encounterVisitHandler: '',
    });

    // Simulate loading saved config
    useEffect(() => {
        // In real app: fetch from /ws/rest/v1/adminui/globalProperties or custom endpoint
        const loadConfig = async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock saved config (replace with real API call)
        setForm({
            enableVisits: true,
            autoCloseTask: false,
            visitTypesToAutoClose: ['1'], // Outpatient
            encounterVisitHandler: 'org.openmrs.module.coreapps.AutomaticVisitAssignmentHandler',
        });
        };
        loadConfig();
        setLoading(false);
    }, []);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    
    const handleVisitTypesChange = (values: string[]) => {
      setForm((prev) => ({ ...prev, visitTypesToAutoClose: values }));
    };
    
    const handleSave = async () => {
      // In real app: POST to a custom endpoint or update global properties
      console.log('Saving config:', form);
    
      // Simulate API save
      await new Promise((resolve) => setTimeout(resolve, 800));
    
      toast.success('Visit configuration saved successfully!');
    };

    if (loading) return <p className="p-4">Loading configuration...</p>;

    return (
        <Card>
        <CardHeader>
            <CardTitle>Configure Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Enable Visits */}
            <div className="flex items-center space-x-3 border p-4 rounded-md bg-gray-50">
                <Checkbox
                    id="enableVisits"
                    checked={form.enableVisits}
                    onCheckedChange={(checked) => handleChange('enableVisits', checked)}
                />
                <Label htmlFor="enableVisits" className="font-medium">
                    Enable visits
                </Label>
            </div>

             {/* Start Auto Close Visit Task */}
            <div className="flex items-center space-x-3 border p-4 rounded-md bg-gray-50">
              <Checkbox
                    id="autoCloseTask"
                    checked={form.autoCloseTask}
                    onCheckedChange={(checked) => handleChange('autoCloseTask', checked)}
              />  
              <Label htmlFor="autoCloseTask" className="font-medium">
              Start auto close visit task
              </Label>
            </div>

            {/* Visit Types to Auto Close */}
            <div>
            <Label>Visit Types to Auto Close</Label>
            <Select
                value={form.visitTypesToAutoClose}
                onValueChange={handleVisitTypesChange}
                multiple
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visit types..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_VISIT_TYPES.map((type) => (
                    <SelectItem key={type.uuid} value={type.uuid}>
                    {type.display}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
            These visit types will be automatically closed after a period of inactivity.
            </p>
          </div>

            {/* Encounter Visit Handler */}
            <div>
            <Label>Choose Encounter Visit Handler</Label>
            <Select
                value={form.encounterVisitHandler}
                onValueChange={(value) => handleChange('encounterVisitHandler', value)}
            >
                <SelectTrigger>
                <SelectValue placeholder="Select handler" />
                </SelectTrigger>
                <SelectContent>
                {HANDLERS.map((handler) => (
                    <SelectItem key={handler.value} value={handler.value}>
                    {handler.label}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
                This handler will automatically assign Encounters to Visits.
            </p>
            </div>

            {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
}
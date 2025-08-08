export async function getProvider(personUuid: string) {
  const response = await fetch(`/openmrs/ws/rest/v1/provider?person=${personUuid}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch provider: ${response.statusText}`);
  }

  return response.json(); // returns provider object
}

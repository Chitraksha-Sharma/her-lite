export async function getUser(userUuid: string) {
  const response = await fetch(`/openmrs/ws/rest/v1/user/${userUuid}`, {
    method: "GET",
    credentials: "include", // sends JSESSIONID automatically
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("user--<<",response)
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json(); // returns full user object
}

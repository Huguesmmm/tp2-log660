"use server";

export async function validateCredentials(email: string, password: string) {
  console.log('Fake auth validation pour:', email);
  
  // Validation factice pour tester
  if (email === "test@test.com" && password === "123456") {
    return {
      id: "1",
      email: email,
      name: "Test User"
    };
  }
  
  return null;
}

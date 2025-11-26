const ADMIN_API_BASE_URL = "https://acesso-livre-api.onrender.com/api"; 

const authApi = {
  // Autenticar Usuário 
  async login(email, password) {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admins/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Erro ao fazer login");
      
      const data = await response.json();
      
      // Verifique se a resposta contém o token
      if (data.access_token) {
        // Salvar o token no sessionStorage
        sessionStorage.setItem("authToken", data.token);
      }
      

      console.log("authApi login response:", data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },
}

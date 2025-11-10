async function fetchData() {
  try {
    const response = await fetch(
      "https://acesso-livre-api.onrender.com/api/locations"
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Locations:");
      data.locations.forEach((location, index) => {
        console.log(`Index ${index}:`, location);
      });
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

window.onload = fetchData;

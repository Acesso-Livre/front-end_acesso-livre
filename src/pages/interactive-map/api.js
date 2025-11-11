let locationsData = [];

async function fetchData(id = null) {
  try {
    const url = id ? `https://acesso-livre-api.onrender.com/api/locations/${id}` : "https://acesso-livre-api.onrender.com/api/locations";
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (id) {
        // For specific location - return data without logging
        return data;
      } else {
        // For all locations
        locationsData = data.locations;
        return locationsData;
      }
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return id ? null : [];
  }
}

async function getLocations(skip = 0, limit = 100) {
  try {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    const url = `https://acesso-livre-api.onrender.com/api/locations/?${params.toString()}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data.locations;
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

async function getAccessibilityItems() {
  try {
    const url = "https://acesso-livre-api.onrender.com/api/locations/accessibility-items/";

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data.accessibility_items;
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

window.onload = fetchData;
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

async function getLocationById(locationId) {
  try {
    // Tentar buscar na API primeiro
    const allLocations = await getLocations(0, 100);
    let location = allLocations.find(loc => loc.id == locationId);

    // Se não encontrou na API, usar dados dos pins do map.js
    if (!location && window.pins) {
      location = window.pins.find(p => p.id == locationId);
    }

    console.log('Found location:', location);
    return location || null;
  } catch (error) {
    console.error("Erro ao buscar localização:", error);
    // Fallback para dados dos pins
    if (window.pins) {
      return window.pins.find(p => p.id == locationId) || null;
    }
    return null;
  }
}

async function getAccessibilityItemById(itemId) {
  try {
    const url = `https://acesso-livre-api.onrender.com/api/locations/accessibility-items/${itemId}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Erro ao buscar item de acessibilidade: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

// Expor funções para o global para testes no console
window.getLocationById = getLocationById;
window.getAccessibilityItemById = getAccessibilityItemById;

window.onload = fetchData;
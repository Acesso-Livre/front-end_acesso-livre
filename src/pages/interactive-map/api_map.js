let locationsData = [];

async function getAllLocations() {
  try {
    const url = "https://acesso-livre-api.onrender.com/api/locations";
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      locationsData = data.locations;
      return locationsData;
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

async function getLocations(skip = 0, limit = 20) {
  try {
    const params = new URLSearchParams();
    params.append("skip", skip);
    params.append("limit", limit);
    const url = `https://acesso-livre-api.onrender.com/api/locations/?${params}`;

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
    const url =
      "https://acesso-livre-api.onrender.com/api/locations/accessibility-items/";

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
    let location = null;

    // Primeiro tentar dados dos pins (acessibilidade items)
    if (window.pins) {
      const pin = window.pins.find((p) => p.id == locationId);
      if (pin) {
        if (pin.location_id) {
          // Buscar a localização associada
          const allLocations = await getLocations(0, 100);
          location = allLocations.find((loc) => loc.id == pin.location_id);
        } else {
          // Assumir que o pin tem dados de localização
          location = pin;
        }
      }
    }

    // Se não encontrou nos pins, tentar na API
    if (!location) {
      const allLocations = await getLocations(0, 100);
      location = allLocations.find((loc) => loc.id == locationId);
    }

    console.log("Found location:", location);
    return location || null;
  } catch (error) {
    console.error("Erro ao buscar localização:", error);
    // Fallback para dados dos pins
    if (window.pins) {
      const pin = window.pins.find((p) => p.id == locationId);
      if (pin) {
        if (pin.location_id) {
          try {
            const locs = await getLocations(0, 100);
            return locs.find((loc) => loc.id == pin.location_id) || pin;
          } catch {
            return pin;
          }
        } else {
          return pin;
        }
      }
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
      throw new Error(
        "Erro ao buscar item de acessibilidade: " + response.status
      );
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

// Função para criar um novo comentário
async function postComment(commentData) {
  try {
    // Mock: Store in localStorage instead of API
    const comments = JSON.parse(
      localStorage.getItem("pendingComments") || "[]"
    );
    const newComment = { id: Date.now(), ...commentData };
    comments.push(newComment);
    localStorage.setItem("pendingComments", JSON.stringify(comments));
    return newComment;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

// Função para buscar comentários pendentes
async function getPendingComments() {
  try {
    // Mock: Read from localStorage
    const comments = JSON.parse(
      localStorage.getItem("pendingComments") || "[]"
    );
    return comments.filter((c) => c.status === "pending");
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

// Função para aprovar um comentário
async function approveComment(commentId) {
  try {
    // Mock: Update in localStorage
    const comments = JSON.parse(
      localStorage.getItem("pendingComments") || "[]"
    );
    const comment = comments.find((c) => c.id == commentId);
    if (comment) {
      comment.status = "approved";
      localStorage.setItem("pendingComments", JSON.stringify(comments));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return false;
  }
}

// Função para rejeitar um comentário
async function rejectComment(commentId) {
  try {
    // Mock: Update in localStorage
    const comments = JSON.parse(
      localStorage.getItem("pendingComments") || "[]"
    );
    const comment = comments.find((c) => c.id == commentId);
    if (comment) {
      comment.status = "rejected";
      localStorage.setItem("pendingComments", JSON.stringify(comments));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro na requisição:", error);
    return false;
  }
}

// Função para buscar comentários aprovados de um local
async function getApprovedCommentsForLocation(locationId) {
  try {
    // Mock: Read from localStorage
    const comments = JSON.parse(
      localStorage.getItem("pendingComments") || "[]"
    );
    return comments.filter(
      (c) => c.status === "approved" && c.location_id == locationId
    );
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
}

// Expor funções para o global para testes no console
window.getLocationById = getLocationById;
window.getAccessibilityItems = getAccessibilityItems;
window.getAccessibilityItemById = getAccessibilityItemById;
window.postComment = postComment;
window.getApprovedCommentsForLocation = getApprovedCommentsForLocation;
window.onload = getAllLocations;
window.getLocations = getLocations;

let locationsData = [];

async function getAllLocations() {
  try {
    const url = "https://acesso-livre-api.onrender.com/api/locations";
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      locationsData = data.locations || [];
      return locationsData;
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição getAllLocations:", error);
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
      return data.locations || [];
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição getLocations:", error);
    return [];
  }
}

async function getAccessibilityItems() {
  try {
    const url = "https://acesso-livre-api.onrender.com/api/locations/accessibility-items/";
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.accessibility_items || [];
    } else {
      throw new Error("Erro ao fazer requisição: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição getAccessibilityItems:", error);
    return [];
  }
}

async function getLocationById(locationId) {
  try {
    // Tenta pelo cache de locationsData (se já carregado)
    if (locationsData && locationsData.length > 0) {
      const found = locationsData.find((l) => l.id == locationId);
      if (found) return found;
    }

    // Caso não esteja no cache, buscar lista (limit maior)
    const all = await getLocations(0, 100);
    return all.find((l) => l.id == locationId) || null;
  } catch (error) {
    console.error("Erro ao buscar localização getLocationById:", error);
    return null;
  }
}

async function getAccessibilityItemById(itemId) {
  try {
    const url = `https://acesso-livre-api.onrender.com/api/locations/accessibility-items/${itemId}`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Erro ao buscar item de acessibilidade: " + response.status);
    }
  } catch (error) {
    console.error("Erro na requisição getAccessibilityItemById:", error);
    return null;
  }
}

async function postComment(commentData) {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar comentário");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro postComment:", error);
    return null;
  }
}

// Buscar comentários pendentes (admin)
async function getPendingComments() {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments/pending`);
    if (!response.ok) throw new Error("Erro ao buscar pendentes");
    return await response.json();
  } catch (error) {
    console.error("Erro getPendingComments:", error);
    return [];
  }
}

// Aprovar comentário
async function approveComment(commentId) {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments/${commentId}/approve`, {
      method: "PUT",
    });
    return response.ok;
  } catch (error) {
    console.error("Erro approveComment:", error);
    return false;
  }
}

// Rejeitar comentário
async function rejectComment(commentId) {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments/${commentId}/reject`, {
      method: "PUT",
    });
    return response.ok;
  } catch (error) {
    console.error("Erro rejectComment:", error);
    return false;
  }
}

// Buscar SOMENTE comentários aprovados de um local
async function getApprovedCommentsForLocation(locationId) {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments/${locationId}/comments`);

    if (!response.ok) throw new Error("Erro buscar comentários aprovados");

    const data = await response.json();

    return data.comments || [];
  } catch (error) {
    console.error("Erro getApprovedCommentsForLocation:", error);
    return [];
  }
}

// Buscar TODOS os comentários de um local (pendente, aprovado, rejeitado)
async function getCommentsByLocationId(locationId) {
  try {
    const response = await fetch(`https://acesso-livre-api.onrender.com/api/comments/${locationId}/comments`);
    if (!response.ok) throw new Error("Erro ao buscar comentários");
    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error("Erro getCommentsByLocationId:", error);
    return [];
  }
}

// Export para map.js usar
window.api = {
  getAllLocations,
  getLocations,
  getAccessibilityItems,
  getLocationById,
  getAccessibilityItemById,
  postComment,
  getPendingComments,
  approveComment,
  rejectComment,
  getApprovedCommentsForLocation,
  getCommentsByLocationId,
};


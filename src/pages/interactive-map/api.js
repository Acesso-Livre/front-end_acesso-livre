async function fetchData() {
            try {
                const response = await fetch('https://acesso-livre-api.onrender.com/api/locations'); // Endereço da API FastAPI

                if (response.ok) {
                    const data = await response.json();
                    console.log('Location:');
                    data.forEach(location => {
                        console.log(location);
                    });
                } else {
                    throw new Error('Erro ao fazer requisição: ' + response.status);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
            }
        }

window.onload = fetchData;
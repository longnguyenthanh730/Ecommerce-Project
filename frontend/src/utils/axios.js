import axios from 'axios'

const apiInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/',
    // baseURL: 'https://final-project-api.up.railway.app/api/v1/',
    timeout: 30000,

    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

export default apiInstance
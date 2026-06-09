import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'participant',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const registerRes = await axios.post('${API_BASE}/api/register/',formData); 
      if (registerRes.status === 200 || registerRes.status === 201) {
        // Automatically log in
        const loginRes = await axios.post('${API_BASE}/api/login/', {
            username: formData.username,
            password: formData.password,
        });

          const loginData = loginRes.data;
          localStorage.setItem('access_token', loginData.access);
          localStorage.setItem('refresh_token', loginData.refresh);

          // Fetch role
          const userRes = await axios.get(`${API_BASE}/api/user/`, {
          headers: {
            Authorization: `Bearer ${loginData.access}`,
          },
        });
  const user = userRes.data;
        if (user.role === 'participant') {
          navigate('/events');
        } else {
          navigate('/add_event');
        }
      }
    } catch (err) {
      if (err.response) {
        // Server responded with an error status
        alert('Error: ' + JSON.stringify(err.response.data));
      } else {
        alert('Error: ' + err.message);
      }
    }
  };

          
       

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input name="username" placeholder="Username" onChange={handleChange} required /><br />
        <input name="email" placeholder="Email" onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br />
        <select name="role" onChange={handleChange}>
          <option value="participant">Participant</option>
          <option value="coordinator">Coordinator</option>
        </select><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;

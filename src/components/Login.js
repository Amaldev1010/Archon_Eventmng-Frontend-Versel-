import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const registerRes = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (registerRes.ok) {
        // Automatically log in
        const loginRes = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem('access_token', loginData.access);
          localStorage.setItem('refresh_token', loginData.refresh);

          // Fetch role
          const userRes = await fetch('http://localhost:8000/api/user/', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${loginData.access}`,
            },
          });

          if (userRes.ok) {
            const user = await userRes.json();
            if (user.role === 'participant') {
              navigate('/events');
            } else {
              navigate('/add_event');
            }
          } else {
            alert('Failed to fetch user data');
          }
        } else {
          alert('Login after registration failed');
        }
      } else {
        const error = await registerRes.json();
        alert('Registration failed: ' + JSON.stringify(error));
      }
    } catch (err) {
      alert('Error: ' + err.message);
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

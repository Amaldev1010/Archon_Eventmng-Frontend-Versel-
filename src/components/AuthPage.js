"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react"

function EnhancedAuthPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef(null)
  const formRef = useRef(null)

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    role: "participant",
    phone_number: "",
    department: "",
    year_of_study: "",
    college_name: "",
  })

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // Enhanced mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePosition({ x: x * 150, y: y * 150 })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return

    setIsTransitioning(true)

    // Start transition
    setTimeout(() => {
      setActiveTab(newTab)
    }, 200)

    // End transition
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })

      if (res.ok) {
        alert("Registration successful! Please login manually.")
        setRegisterData({
          username: "",
          email: "",
          password: "",
          role: "participant",
          phone_number: "",
          department: "",
          year_of_study: "",
          college_name: "",
        })
        handleTabChange("login")
      } else {
        const error = await res.json()
        alert("Registration failed: " + JSON.stringify(error))
      }
    } catch (err) {
      alert("Error during registration: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)

        const userRes = await fetch("http://localhost:8000/api/user/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        })

        if (userRes.ok) {
          const user = await userRes.json()
          if (user.role === "participant") {
            navigate("/events")
          } else if (user.role === "coordinator") {
            navigate("/add_event")
          }
        } else {
          alert("Login successful, but failed to fetch user info")
        }
      } else {
        const error = await res.json()
        alert("Login failed: " + (error.detail || "Invalid credentials"))
      }
    } catch (err) {
      alert("Login error: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(79, 70, 229, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)
      `,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    // Enhanced aurora particles with purple/blue theme
    particle1: {
      position: "absolute",
      top: "8%",
      left: "12%",
      width: "12px",
      height: "12px",
      background: "radial-gradient(circle, #8b5cf6 0%, #6366f1 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 12s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 30px #8b5cf6, 0 0 60px #8b5cf6, 0 0 90px #6366f1",
      filter: "blur(1px)",
    },
    particle2: {
      position: "absolute",
      top: "25%",
      right: "18%",
      width: "16px",
      height: "16px",
      background: "radial-gradient(circle, #6366f1 0%, #4f46e5 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 15s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.35}px, ${mousePosition.y * 0.35}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 25px #6366f1, 0 0 50px #6366f1, 0 0 75px #4f46e5",
      filter: "blur(1px)",
    },
    particle3: {
      position: "absolute",
      bottom: "20%",
      left: "25%",
      width: "14px",
      height: "14px",
      background: "radial-gradient(circle, #4f46e5 0%, #3730a3 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 18s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 35px #4f46e5, 0 0 70px #4f46e5, 0 0 105px #3730a3",
      filter: "blur(1px)",
    },
    particle4: {
      position: "absolute",
      bottom: "35%",
      right: "15%",
      width: "10px",
      height: "10px",
      background: "radial-gradient(circle, #a855f7 0%, #7c3aed 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 10s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.25}px, ${mousePosition.y * 0.25}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #7c3aed",
      filter: "blur(1px)",
    },
    particle5: {
      position: "absolute",
      top: "15%",
      left: "35%",
      width: "8px",
      height: "8px",
      background: "radial-gradient(circle, #ffffff 0%, #e2e8f0 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 14s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 15px #ffffff, 0 0 30px #e2e8f0",
      filter: "blur(0.5px)",
    },
    particle6: {
      position: "absolute",
      bottom: "45%",
      right: "35%",
      width: "6px",
      height: "6px",
      background: "radial-gradient(circle, #f1f5f9 0%, #cbd5e1 70%, transparent 100%)",
      borderRadius: "50%",
      animation: "auroraFloat 16s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px)`,
      transition: "transform 0.3s ease-out",
      boxShadow: "0 0 10px #f1f5f9, 0 0 20px #cbd5e1",
      filter: "blur(0.5px)",
    },
    // Enhanced floating aurora shapes
    floatingShape1: {
      position: "absolute",
      top: "5%",
      right: "8%",
      width: "180px",
      height: "180px",
      background: `
        radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      animation: "auroraMorph 20s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.12}px, ${mousePosition.y * 0.12}px)`,
      transition: "transform 0.4s ease-out",
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(139, 92, 246, 0.1)",
    },
    floatingShape2: {
      position: "absolute",
      bottom: "8%",
      left: "6%",
      width: "150px",
      height: "150px",
      background: `
        radial-gradient(circle at 40% 60%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
      `,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      animation: "auroraMorph 25s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.18}px, ${mousePosition.y * 0.18}px)`,
      transition: "transform 0.4s ease-out",
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(79, 70, 229, 0.1)",
    },
    floatingShape3: {
      position: "absolute",
      top: "40%",
      left: "2%",
      width: "120px",
      height: "120px",
      background: `
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)
      `,
      borderRadius: "45% 55% 40% 60% / 50% 35% 65% 50%",
      animation: "auroraMorph 30s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`,
      transition: "transform 0.4s ease-out",
      backdropFilter: "blur(2px)",
      border: "1px solid rgba(168, 85, 247, 0.1)",
    },
    floatingShape4: {
      position: "absolute",
      bottom: "25%",
      right: "3%",
      width: "100px",
      height: "100px",
      background: `
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(226, 232, 240, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "35% 65% 55% 45% / 40% 60% 40% 60%",
      animation: "auroraMorph 22s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
      transition: "transform 0.4s ease-out",
      backdropFilter: "blur(2px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
    },
    mainCard: {
      position: "relative",
      zIndex: 10,
      width: "100%",
      maxWidth: "500px",
      transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
      transition: "transform 0.2s ease-out",
    },
    header: {
      textAlign: "center",
      marginBottom: "48px",
      animation: "fadeInUp 1.2s ease-out",
    },
    title: {
      fontSize: "52px",
      fontWeight: "800",
      background: `
        linear-gradient(135deg, 
          #1e293b 0%, 
          #8b5cf6 25%, 
          #6366f1 50%, 
          #4f46e5 75%, 
          #1e293b 100%
        )
      `,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundSize: "200% 200%",
      animation: "gradientShift 4s ease-in-out infinite, titleFloat 6s ease-in-out infinite",
      marginBottom: "16px",
      textShadow: "0 0 60px rgba(139, 92, 246, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      letterSpacing: "-1px",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "18px",
      fontWeight: "300",
      animation: "fadeInUp 1.2s ease-out 0.3s both",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
    },
    card: {
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(248, 250, 252, 0.9) 100%
        )
      `,
      backdropFilter: "blur(30px) saturate(180%)",
      borderRadius: "32px",
      boxShadow: `
        0 20px 60px rgba(139, 92, 246, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        0 0 0 1px rgba(139, 92, 246, 0.1)
      `,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      overflow: "hidden",
      animation: "slideUpScale 1.2s ease-out 0.4s both",
      position: "relative",
    },
    // Enhanced tab container with purple/blue theme
    tabContainer: {
      display: "flex",
      background: "rgba(139, 92, 246, 0.05)",
      position: "relative",
      backdropFilter: "blur(10px)",
    },
    tabIndicator: {
      position: "absolute",
      bottom: 0,
      left: activeTab === "login" ? "0%" : "50%",
      width: "50%",
      height: "100%",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.2) 0%, 
          rgba(99, 102, 241, 0.15) 100%
        )
      `,
      borderRadius: "0",
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 0 30px rgba(139, 92, 246, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)",
      backdropFilter: "blur(20px)",
    },
    tab: {
      flex: 1,
      padding: "24px 32px",
      fontWeight: "700",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      fontSize: "17px",
      position: "relative",
      zIndex: 2,
      background: "transparent",
    },
    activeTab: {
      color: "#1e293b",
      textShadow: "0 0 20px rgba(139, 92, 246, 0.3), 0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    inactiveTab: {
      color: "#64748b",
    },
    // Enhanced form container
    formContainer: {
      padding: "48px",
      position: "relative",
      overflow: "hidden",
    },
    formWrapper: {
      transform: isTransitioning
        ? `translateX(${activeTab === "login" ? "100%" : "-100%"}) scale(0.9) rotateY(10deg)`
        : "translateX(0) scale(1) rotateY(0deg)",
      opacity: isTransitioning ? 0 : 1,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      transformStyle: "preserve-3d",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "32px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      animation: `slideInField 0.8s ease-out both`,
    },
    gridTwo: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    label: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "6px",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "18px 24px",
      paddingLeft: "56px",
      borderRadius: "20px",
      border: "2px solid rgba(139, 92, 246, 0.1)",
      fontSize: "16px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )
      `,
      backdropFilter: "blur(20px) saturate(180%)",
      outline: "none",
      boxSizing: "border-box",
      color: "#1e293b",
      fontWeight: "500",
      boxShadow: "inset 0 2px 10px rgba(139, 92, 246, 0.05)",
    },
    inputFocus: {
      borderColor: "rgba(139, 92, 246, 0.4)",
      boxShadow: `
        0 0 0 4px rgba(139, 92, 246, 0.1),
        0 0 30px rgba(139, 92, 246, 0.15),
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 2px 10px rgba(139, 92, 246, 0.05)
      `,
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(248, 250, 252, 0.8) 100%
        )
      `,
      transform: "translateY(-2px)",
    },
    inputIcon: {
      position: "absolute",
      left: "20px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#8a5cf6ff",
      transition: "all 0.3s ease",
      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    },
    passwordToggle: {
      position: "absolute",
      right: "20px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "rgba(139, 92, 246, 0.1)",
      border: "none",
      color: "#64748b",
      cursor: "pointer",
      padding: "10px",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },
    select: {
      width: "100%",
      padding: "18px 24px",
      borderRadius: "20px",
      border: "2px solid rgba(139, 92, 246, 0.1)",
      fontSize: "16px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )
      `,
      backdropFilter: "blur(20px) saturate(180%)",
      outline: "none",
      boxSizing: "border-box",
      color: "#1e293b",
      fontWeight: "500",
      boxShadow: "inset 0 2px 10px rgba(139, 92, 246, 0.05)",
    },
    button: {
      width: "100%",
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 25%, 
          #4f46e5 75%, 
          #3730a3 100%
        )
      `,
      backgroundSize: "200% 200%",
      color: "#ffffff",
      padding: "20px 32px",
      borderRadius: "20px",
      fontWeight: "700",
      fontSize: "18px",
      boxShadow: `
        0 10px 30px rgba(139, 92, 246, 0.3),
        0 0 60px rgba(99, 102, 241, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      border: "none",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    buttonHover: {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: `
        0 15px 40px rgba(139, 92, 246, 0.4),
        0 0 80px rgba(99, 102, 241, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3)
      `,
    },
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <style>
        {`
          @keyframes auroraFloat {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1); 
              opacity: 0.8;
            }
            25% { 
              transform: translateY(-50px) rotate(90deg) scale(1.3); 
              opacity: 1;
            }
            50% { 
              transform: translateY(-25px) rotate(180deg) scale(0.9); 
              opacity: 0.7;
            }
            75% { 
              transform: translateY(-40px) rotate(270deg) scale(1.2); 
              opacity: 0.9;
            }
          }
          
          @keyframes auroraMorph {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1);
              border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
              opacity: 0.7;
            }
            20% { 
              transform: translateY(-25px) rotate(72deg) scale(1.15);
              border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
              opacity: 0.9;
            }
            40% { 
              transform: translateY(-40px) rotate(144deg) scale(0.95);
              border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
              opacity: 1;
            }
            60% { 
              transform: translateY(-30px) rotate(216deg) scale(1.2);
              border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
              opacity: 0.8;
            }
            80% { 
              transform: translateY(-20px) rotate(288deg) scale(1.1);
              border-radius: 45% 55% 40% 60% / 50% 35% 65% 50%;
              opacity: 0.95;
            }
          }
          
          @keyframes gradientShift {
            0%, 100% { 
              background-position: 0% 50%; 
            }
            50% { 
              background-position: 100% 50%; 
            }
          }
          
          @keyframes titleFloat {
            0%, 100% { 
              transform: translateY(0px); 
            }
            50% { 
              transform: translateY(-10px); 
            }
          }
          
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(50px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes slideUpScale {
            from { 
              opacity: 0; 
              transform: translateY(80px) scale(0.8) rotateX(10deg); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1) rotateX(0deg); 
            }
          }
          
          @keyframes slideInField {
            from {
              opacity: 0;
              transform: translateX(-40px) rotateY(-10deg);
            }
            to {
              opacity: 1;
              transform: translateX(0) rotateY(0deg);
            }
          }
          
          input::placeholder, select option {
            color: #94a3b8;
            font-weight: 400;
          }
          
          input:focus, select:focus {
            border-color: rgba(139, 92, 246, 0.4);
            box-shadow: 
              0 0 0 4px rgba(139, 92, 246, 0.1),
              0 0 30px rgba(139, 92, 246, 0.15),
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 2px 10px rgba(139, 92, 246, 0.05);
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(248, 250, 252, 0.8) 100%
            );
            transform: translateY(-2px);
          }
          
          input:focus + .input-icon {
            color: #8b5cf6;
            transform: translateY(-50%) scale(1.1);
            filter: drop-shadow(0 0 10px #8b5cf6);
          }
          
          button:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 
              0 15px 40px rgba(139, 92, 246, 0.4),
              0 0 80px rgba(99, 102, 241, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          
          button:active {
            transform: translateY(-2px) scale(1.01);
          }
          
          .password-toggle:hover {
            background: rgba(139, 92, 246, 0.2);
            color: #8b5cf6;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
          }
          
          .tab:hover {
            background: rgba(139, 92, 246, 0.05);
            color: #1e293b;
          }
          
          select option {
            background: #ffffff;
            color: #1e293b;
          }
          
          /* Staggered field animations */
          .field-group:nth-child(1) { animation-delay: 0.1s; }
          .field-group:nth-child(2) { animation-delay: 0.2s; }
          .field-group:nth-child(3) { animation-delay: 0.3s; }
          .field-group:nth-child(4) { animation-delay: 0.4s; }
          .field-group:nth-child(5) { animation-delay: 0.5s; }
          .field-group:nth-child(6) { animation-delay: 0.6s; }
          .field-group:nth-child(7) { animation-delay: 0.7s; }
          
          @media (max-width: 768px) {
            .grid-two {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      {/* Enhanced Aurora Particles */}
      <div style={styles.particle1}></div>
      <div style={styles.particle2}></div>
      <div style={styles.particle3}></div>
      <div style={styles.particle4}></div>
      <div style={styles.particle5}></div>
      <div style={styles.particle6}></div>

      {/* Enhanced Aurora Shapes */}
      <div style={styles.floatingShape1}></div>
      <div style={styles.floatingShape2}></div>
      <div style={styles.floatingShape3}></div>
      <div style={styles.floatingShape4}></div>

      <div style={styles.mainCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Sparkles size={40} />
            Event Hub
            <Star size={32} />
          </h1>
          <p style={styles.subtitle}>Join the community and discover amazing events</p>
        </div>

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <div style={styles.tabIndicator}></div>
            <button
              onClick={() => handleTabChange("login")}
              className="tab"
              style={{
                ...styles.tab,
                ...(activeTab === "login" ? styles.activeTab : styles.inactiveTab),
              }}
            >
              <LogIn size={22} />
              Login
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className="tab"
              style={{
                ...styles.tab,
                ...(activeTab === "register" ? styles.activeTab : styles.inactiveTab),
              }}
            >
              <UserPlus size={22} />
              Register
            </button>
          </div>

          <div style={styles.formContainer}>
            <div ref={formRef} style={styles.formWrapper}>
              {activeTab === "login" ? (
                <form onSubmit={handleLogin} style={styles.form}>
                  <div style={styles.fieldGroup} className="field-group">
                    <label style={styles.label}>Username</label>
                    <div style={styles.inputContainer}>
                      <User style={styles.inputIcon} className="input-icon" size={22} />
                      <input
                        name="username"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup} className="field-group">
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputContainer}>
                      <Lock style={styles.inputIcon} className="input-icon" size={22} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        style={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.passwordToggle}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? (
                      "Signing in..."
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={styles.form}>
                  <div style={styles.gridTwo}>
                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Username</label>
                      <div style={styles.inputContainer}>
                        <User style={styles.inputIcon} className="input-icon" size={22} />
                        <input
                          name="username"
                          placeholder="Username"
                          value={registerData.username}
                          onChange={handleRegisterChange}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Email</label>
                      <div style={styles.inputContainer}>
                        <Mail style={styles.inputIcon} className="input-icon" size={22} />
                        <input
                          name="email"
                          type="email"
                          placeholder="Email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.fieldGroup} className="field-group">
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputContainer}>
                      <Lock style={styles.inputIcon} className="input-icon" size={22} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        style={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.passwordToggle}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.gridTwo}>
                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Phone</label>
                      <div style={styles.inputContainer}>
                        <Phone style={styles.inputIcon} className="input-icon" size={22} />
                        <input
                          name="phone_number"
                          placeholder="Phone number"
                          value={registerData.phone_number}
                          onChange={handleRegisterChange}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Department</label>
                      <div style={styles.inputContainer}>
                        <GraduationCap style={styles.inputIcon} className="input-icon" size={22} />
                        <input
                          name="department"
                          placeholder="Department"
                          value={registerData.department}
                          onChange={handleRegisterChange}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.gridTwo}>
                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Year of Study</label>
                      <div style={styles.inputContainer}>
                        <Calendar style={styles.inputIcon} className="input-icon" size={22} />
                        <input
                          name="year_of_study"
                          placeholder="Year (e.g., 2)"
                          value={registerData.year_of_study}
                          onChange={handleRegisterChange}
                          required
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup} className="field-group">
                      <label style={styles.label}>Role</label>
                      <select
                        name="role"
                        value={registerData.role}
                        onChange={handleRegisterChange}
                        style={styles.select}
                      >
                        <option value="participant">Participant</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.fieldGroup} className="field-group">
                    <label style={styles.label}>College Name</label>
                    <div style={styles.inputContainer}>
                      <Building style={styles.inputIcon} className="input-icon" size={22} />
                      <input
                        name="college_name"
                        placeholder="College name"
                        value={registerData.college_name}
                        onChange={handleRegisterChange}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAuthPage

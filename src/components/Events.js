"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, Users, LogOut, UserX, CheckCircle, XCircle, Sparkles, Zap } from "lucide-react"

const EnhancedEventsPage = () => {
  const [events, setEvents] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const accessToken = localStorage.getItem("access_token")

  // Enhanced mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePosition({ x: x * 80, y: y * 80 })
      }
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!accessToken) {
      navigate("/")
      return
    }

    const headers = { Authorization: `Bearer ${accessToken}` }

    axios.get("http://localhost:8000/api/user/", { headers }).catch(() => navigate("/"))

    axios
      .get("http://localhost:8000/api/events/", { headers })
      .then((response) => {
        setEvents(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching events:", error)
        if (error.response?.status === 401) navigate("/")
        setIsLoading(false)
      })

    axios
      .get("http://localhost:8000/api/events/registered/", { headers })
      .then((response) => {
        // Expecting response.data as [{ id, registered_at }]
        setRegisteredEvents(response.data)
      })
      .catch((error) => console.error("Error fetching registered events:", error))
  }, [accessToken, navigate])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/")
  }

  const handleDeleteAccount = () => {
    axios
      .delete("http://localhost:8000/api/delete-account/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/")
      })
      .catch((error) => console.error("Account deletion failed:", error))
  }

  const handleRegister = async (eventId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/events/${eventId}/register/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert("✅ Registered successfully! A confirmation email has been sent.")
      // Add the new registration with current timestamp as fallback
      setRegisteredEvents((prev) => [
        ...prev,
        { id: eventId, registered_at: new Date().toISOString() }
      ])
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          alert("❌ Unauthorized. Please log in again.")
        } else if (error.response.status === 400) {
          alert("⚠️ You may already be registered for this event.")
        } else {
          alert(`Registration failed: ${error.response.data.detail || "Try again later."}`)
        }
      } else {
        alert("Network error. Please try again.")
      }
    }
  }

  const handleCancel = async (eventId) => {
    try {
      await axios.delete(`http://localhost:8000/api/events/${eventId}/cancel/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      alert("❌ Registration cancelled. A cancellation email has been sent.")
      setRegisteredEvents((prev) => prev.filter((reg) => reg.id !== eventId))
    } catch (error) {
      console.error("Cancel failed:", error.response?.data || error.message)
      alert("Something went wrong while canceling. Please try again.")
    }
  }

  // Function to check if cancel button should be shown based on registration date
  const canCancelEvent = (registeredAt) => {
    try {
      const currentDate = new Date()
      const regDateTime = new Date(registeredAt)

      // Log for debugging
      console.log("Current Date:", currentDate.toISOString())
      console.log("Registration Date:", registeredAt, regDateTime.toISOString())

      // Check if registration date is valid
      if (isNaN(regDateTime.getTime())) {
        console.error("Invalid registration date:", registeredAt)
        return false
      }

      // Calculate the difference in days
      const timeDiff = currentDate.getTime() - regDateTime.getTime()
      const daysDiff = timeDiff / (1000 * 3600 * 24)

      console.log("Days since registration:", daysDiff)

      // Allow cancellation if registration is less than 2 days old
      return daysDiff < 2
    } catch (error) {
      console.error("Error in canCancelEvent:", error.message)
      return false
    }
  }

  const styles = {
    container: {
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(79, 70, 229, 0.04) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)
      `,
      position: "relative",
      overflow: "hidden",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    floatingElement1: {
      position: "fixed",
      top: "10%",
      left: "5%",
      width: "100px",
      height: "100px",
      background: `
        radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "50%",
      animation: "auroraFloat 12s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15 + scrollY * 0.1}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(139, 92, 246, 0.15)",
    },
    floatingElement2: {
      position: "fixed",
      top: "20%",
      right: "10%",
      width: "80px",
      height: "80px",
      background: `
        radial-gradient(circle at 40% 60%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
      `,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      animation: "auroraMorph 18s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2 + scrollY * 0.05}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(79, 70, 229, 0.15)",
    },
    floatingElement3: {
      position: "fixed",
      bottom: "15%",
      left: "8%",
      width: "120px",
      height: "120px",
      background: `
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)
      `,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      animation: "auroraMorph 22s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.12}px, ${mousePosition.y * 0.12 + scrollY * 0.03}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(168, 85, 247, 0.15)",
    },
    floatingElement4: {
      position: "fixed",
      top: "60%",
      right: "5%",
      width: "70px",
      height: "70px",
      background: `
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(226, 232, 240, 0.1) 0%, transparent 50%)
      `,
      borderRadius: "45% 55% 40% 60% / 50% 35% 65% 50%",
      animation: "auroraMorph 16s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.18}px, ${mousePosition.y * 0.18 + scrollY * 0.08}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(2px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    content: {
      position: "relative",
      zIndex: 10,
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 24px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "48px",
      animation: "fadeInUp 1s ease-out",
      transform: `translateY(${scrollY * 0.1}px)`,
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    title: {
      fontSize: "48px",
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
      animation: "gradientShift 4s ease-in-out infinite",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      textShadow: "0 0 60px rgba(139, 92, 246, 0.2)",
      letterSpacing: "-1px",
    },
    subtitle: {
      color: "#64748b",
      marginTop: "12px",
      fontSize: "18px",
      fontWeight: "300",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
    },
    headerButtons: {
      display: "flex",
      gap: "16px",
    },
    button: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "14px 24px",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.3s ease",
      fontSize: "15px",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )
      `,
      backdropFilter: "blur(20px)",
      color: "#1e293b",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      border: "1px solid rgba(139, 92, 246, 0.1)",
    },
    card: {
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(248, 250, 252, 0.9) 100%
        )
      `,
      backdropFilter: "blur(30px) saturate(180%)",
      borderRadius: "28px",
      boxShadow: `
        0 20px 60px rgba(139, 92, 246, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        0 0 0 1px rgba(139, 92, 246, 0.05)
      `,
      border: "1px solid rgba(255, 255, 255, 0.3)",
      padding: "40px",
      marginBottom: "40px",
      animation: "slideUpScale 1s ease-out",
      transform: `translateY(${scrollY * 0.05}px)`,
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "32px",
    },
    cardIcon: {
      padding: "16px",
      borderRadius: "20px",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 100%
        )
      `,
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    cardTitle: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#1e293b",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.05)",
    },
    emptyState: {
      textAlign: "center",
      padding: "80px 0",
    },
    emptyIcon: {
      width: "140px",
      height: "140px",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.1) 0%, 
          rgba(99, 102, 241, 0.05) 100%
        )
      `,
      borderRadius: "50%",
      margin: "0 auto 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "pulse 2s ease-in-out infinite",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(139, 92, 246, 0.1)",
    },
    emptyText: {
      color: "#64748b",
      fontSize: "20px",
      fontWeight: "300",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    },
    eventGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    eventCard: {
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.9) 0%, 
          rgba(248, 250, 252, 0.8) 100%
        )
      `,
      backdropFilter: "blur(25px) saturate(180%)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: `
        0 15px 45px rgba(139, 92, 246, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `,
      border: "1px solid rgba(139, 92, 246, 0.1)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: "slideUpScale 1s ease-out",
      position: "relative",
      overflow: "hidden",
    },
    eventCardRegistered: {
      background: `
        linear-gradient(135deg, 
          rgba(34, 197, 94, 0.1) 0%, 
          rgba(22, 163, 74, 0.05) 100%
        )
      `,
      border: "1px solid rgba(34, 197, 94, 0.2)",
      boxShadow: `
        0 15px 45px rgba(34, 197, 94, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    eventHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px",
    },
    eventTitleContainer: {
      flex: 1,
    },
    eventTitleRow: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "16px",
    },
    eventTitle: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#1e293b",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.05)",
      transition: "color 0.3s ease",
    },
    registeredBadge: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      background: `
        linear-gradient(135deg, 
          rgba(34, 197, 94, 0.9) 0%, 
          rgba(22, 163, 74, 0.8) 100%
        )
      `,
      color: "#ffffff",
      borderRadius: "24px",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
      backdropFilter: "blur(10px)",
    },
    eventDescription: {
      color: "#64748b",
      marginBottom: "24px",
      lineHeight: "1.7",
      fontSize: "16px",
      textShadow: "0 1px 10px rgba(0, 0, 0, 0.05)",
    },
    eventMeta: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      fontSize: "15px",
    },
    metaItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.08) 0%, 
          rgba(99, 102, 241, 0.05) 100%
        )
      `,
      backdropFilter: "blur(15px)",
      padding: "10px 16px",
      borderRadius: "16px",
      color: "#475569",
      border: "1px solid rgba(139, 92, 246, 0.1)",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.05)",
    },
    eventActions: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "28px",
    },
    actionButton: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "14px 28px",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "15px",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.15)",
      position: "relative",
      overflow: "hidden",
    },
    registerButton: {
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
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    cancelButton: {
      background: `
        linear-gradient(135deg, 
          #ef4444 0%, 
          #dc2626 50%, 
          #b91c1c 100%
        )
      `,
      backgroundSize: "200% 200%",
      color: "#ffffff",
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    cancelDisabledMessage: {
      color: "#64748b",
      fontSize: "15px",
      fontWeight: "500",
      textShadow: "0 1px 10px rgba(0, 0, 0, 0.05)",
      padding: "14px 28px",
    },
    loadingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(79, 70, 229, 0.04) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)
      `,
    },
    loadingContent: {
      textAlign: "center",
    },
    spinner: {
      width: "100px",
      height: "100px",
      border: "4px solid rgba(139, 92, 246, 0.1)",
      borderTop: "4px solid #8b5cf6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 24px",
      boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)",
    },
    loadingText: {
      color: "#1e293b",
      fontSize: "20px",
      fontWeight: "300",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
    },
  }

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading events...</p>
        </div>
      </div>
    )
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
              transform: translateY(80px) scale(0.8); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          .event-card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 25px 60px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.1);
          }
          
          .action-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.25);
          }
          
          .header-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(248, 250, 252, 0.8) 100%
            );
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
          }
        `}
      </style>

      {/* Aurora Floating Elements */}
      <div style={styles.floatingElement1}></div>
      <div style={styles.floatingElement2}></div>
      <div style={styles.floatingElement3}></div>
      <div style={styles.floatingElement4}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerLeft}>
              <Sparkles color="#8b5cf6" size={40} />
              <h1 style={styles.title}>
                Available Events
                <Zap size={36} />
              </h1>
            </div>
            <p style={styles.subtitle}>Discover and register for exciting events</p>
          </div>
          <div style={styles.headerButtons}>
            <button onClick={handleLogout} style={styles.button} className="header-button">
              <LogOut size={20} />
              Logout
            </button>
            <button onClick={handleDeleteAccount} style={styles.button} className="header-button">
              <UserX size={20} />
              Delete Account
            </button>
          </div>
        </div>

        {/* Available Events */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <Calendar size={28} />
            </div>
            <h2 style={styles.cardTitle}>All Events</h2>
          </div>

          {events.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Calendar size={48} color="#94a3b8" />
              </div>
              <p style={styles.emptyText}>No events available at the moment.</p>
            </div>
          ) : (
            <div style={styles.eventGrid}>
              {events.map((event, index) => {
                const registration = registeredEvents.find((reg) => reg.id === event.id)
                const isRegistered = !!registration
                return (
                  <div
                    key={event.id}
                    className="event-card"
                    style={{
                      ...styles.eventCard,
                      ...(isRegistered ? styles.eventCardRegistered : {}),
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <div style={styles.eventHeader}>
                      <div style={styles.eventTitleContainer}>
                        <div style={styles.eventTitleRow}>
                          <h3 style={styles.eventTitle}>{event.title}</h3>
                          {isRegistered && (
                            <div style={styles.registeredBadge}>
                              <CheckCircle size={16} />
                              Registered
                            </div>
                          )}
                        </div>
                        <p style={styles.eventDescription}>{event.description}</p>
                        <div style={styles.eventMeta}>
                          <div style={styles.metaItem}>
                            <Calendar size={18} />
                            {event.date}
                          </div>
                          <div style={styles.metaItem}>
                            <Clock size={18} />
                            {event.time}
                          </div>
                          <div style={styles.metaItem}>
                            <MapPin size={18} />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.eventActions}>
                      {isRegistered ? (
                        canCancelEvent(registration.registered_at) ? (
                          <button
                            onClick={() => handleCancel(event.id)}
                            className="action-button"
                            style={{ ...styles.actionButton, ...styles.cancelButton }}
                          >
                            <XCircle size={18} />
                            Cancel Registration
                          </button>
                        ) : (
                          <p style={styles.cancelDisabledMessage}>
                            Cancellation not available (more than 2 days since registration)
                          </p>
                        )
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="action-button"
                          style={{ ...styles.actionButton, ...styles.registerButton }}
                        >
                          <CheckCircle size={18} />
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Registered Events */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <Users size={28} />
            </div>
            <h2 style={styles.cardTitle}>Your Registered Events</h2>
          </div>

          {registeredEvents.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Users size={48} color="#94a3b8" />
              </div>
              <p style={styles.emptyText}>You haven't registered for any events yet.</p>
            </div>
          ) : (
            <div style={styles.eventGrid}>
              {events
                .filter((event) => registeredEvents.some((reg) => reg.id === event.id))
                .map((event, index) => {
                  const registration = registeredEvents.find((reg) => reg.id === event.id)
                  return (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{
                        ...styles.eventCard,
                        ...styles.eventCardRegistered,
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      <div style={styles.eventHeader}>
                        <div style={styles.eventTitleContainer}>
                          <div style={styles.eventTitleRow}>
                            <h3 style={styles.eventTitle}>{event.title}</h3>
                            <div style={styles.registeredBadge}>
                              <CheckCircle size={16} />
                              Confirmed
                            </div>
                          </div>
                          <p style={styles.eventDescription}>{event.description}</p>
                          <div style={styles.eventMeta}>
                            <div style={styles.metaItem}>
                              <Calendar size={18} />
                              {event.date}
                            </div>
                            <div style={styles.metaItem}>
                              <Clock size={18} />
                              {event.time}
                            </div>
                            <div style={styles.metaItem}>
                              <MapPin size={18} />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={styles.eventActions}>
                        {canCancelEvent(registration.registered_at) ? (
                          <button
                            onClick={() => handleCancel(event.id)}
                            className="action-button"
                            style={{ ...styles.actionButton, ...styles.cancelButton }}
                          >
                            <XCircle size={18} />
                            Cancel Registration
                          </button>
                        ) : (
                          <p style={styles.cancelDisabledMessage}>
                            Cancellation not available (more than 2 days since registration)
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedEventsPage
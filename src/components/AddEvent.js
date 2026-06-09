"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, Edit3, Trash2, Users, LogOut, UserX, Plus, Sparkles, Zap, Send } from "lucide-react"

function EnhancedAddEvent() {
  const navigate = useNavigate()
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    coordinator: "",
  })
  const [myEvents, setMyEvents] = useState([])
  const [error, setError] = useState("")
  const [editingEventId, setEditingEventId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState({})
  const [messageError, setMessageError] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef(null)
  const accessToken = localStorage.getItem("access_token")

  // Enhanced mouse parallax and scroll effects
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
    const fetchUserAndEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (res.ok) {
          const user = await res.json()
          if (user.role !== "coordinator") {
            alert("Access denied. Only coordinators can add events.")
            navigate("/")
            return
          }

          setEventData((prev) => ({ ...prev, coordinator: user.id }))
          fetchMyEvents()
        } else {
          navigate("/")
        }
      } catch (err) {
        console.error(err)
        alert("Failed to fetch user details")
      }
    }

    fetchUserAndEvents()
  }, [accessToken, navigate])

  const fetchMyEvents = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/events/my-events/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        setMyEvents(data)
        const initialMessages = data.reduce((acc, event) => ({
          ...acc,
          [event.id]: "",
        }), {})
        setMessages(initialMessages)
      } else {
        console.error("Failed to fetch events")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value })
  }

  const handleMessageChange = (eventId, value) => {
    setMessages((prev) => ({
      ...prev,
      [eventId]: value,
    }))
    setMessageError("")
  }

  const handleSendMessage = async (eventId) => {
    const message = messages[eventId]?.trim()
    if (!message) {
      setMessageError("Please enter a message to send.")
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/events/${eventId}/send-message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message }),
      })

      if (res.ok) {
        alert("📧 Message sent to all registered participants!")
        setMessages((prev) => ({
          ...prev,
          [eventId]: "",
        }))
        setMessageError("")
      } else {
        const data = await res.json()
        setMessageError("❌ Failed to send message: " + JSON.stringify(data))
      }
    } catch (err) {
      setMessageError("❌ Error: " + err.message)
    }
  }

  const handleAddOrUpdateEvent = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const url = editingEventId
      ? `http://localhost:8000/api/events/edit/${editingEventId}/`
      : "http://localhost:8000/api/events/add/"
    const method = editingEventId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(eventData),
      })

      if (res.ok) {
        alert(editingEventId ? "✏️ Event updated!" : "✅ Event added!")
        setEditingEventId(null)
        setEventData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          coordinator: eventData.coordinator,
        })
        fetchMyEvents()
      } else {
        const data = await res.json()
        setError("❌ Failed: " + JSON.stringify(data))
      }
    } catch (err) {
      setError("❌ Error: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEvent = (event) => {
    setEventData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      coordinator: event.coordinator,
    })
    setEditingEventId(event.id)
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/events/delete/${eventId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (res.ok) {
        alert("❌ Event cancelled")
        fetchMyEvents()
      } else {
        const errData = await res.json()
        alert("❌ Failed to delete event: " + JSON.stringify(errData))
      }
    } catch (err) {
      alert("❌ Error: " + err.message)
    }
  }

  const handleViewParticipants = (eventId) => {
    navigate(`/participants/${eventId}`)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/")
  }

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/delete-account/", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (res.ok) {
        alert("Account deleted.")
        handleLogout()
      } else {
        const errData = await res.json()
        alert("❌ Failed to delete account: " + JSON.stringify(errData))
      }
    } catch (err) {
      alert("❌ Error: " + err.message)
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
      top: "8%",
      left: "3%",
      width: "110px",
      height: "110px",
      background: `
        radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "50%",
      animation: "auroraFloat 14s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15 + scrollY * 0.08}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(139, 92, 246, 0.15)",
    },
    floatingElement2: {
      position: "fixed",
      top: "25%",
      right: "8%",
      width: "90px",
      height: "90px",
      background: `
        radial-gradient(circle at 40% 60%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
      `,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      animation: "auroraMorph 18s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.18}px, ${mousePosition.y * 0.18 + scrollY * 0.06}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(79, 70, 229, 0.15)",
    },
    floatingElement3: {
      position: "fixed",
      bottom: "12%",
      left: "6%",
      width: "130px",
      height: "130px",
      background: `
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)
      `,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      animation: "auroraMorph 22s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.12}px, ${mousePosition.y * 0.12 + scrollY * 0.04}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(168, 85, 247, 0.15)",
    },
    floatingElement4: {
      position: "fixed",
      top: "50%",
      right: "2%",
      width: "75px",
      height: "75px",
      background: `
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(226, 232, 240, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "45% 55% 40% 60% / 50% 35% 65% 50%",
      animation: "auroraMorph 16s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1 + scrollY * 0.07}px)`,
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
        )`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundSize: "200% 200%",
      animation: "gradientShift 4s ease-in-out infinite",
      textShadow: "0 0 60px rgba(139, 92, 246, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "20px",
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
        )`,
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
        )`,
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
        )`,
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
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    gridTwo: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "28px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    label: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1e293b",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "16px 20px",
      paddingLeft: "50px",
      borderRadius: "18px",
      border: "2px solid rgba(139, 92, 246, 0.1)",
      fontSize: "16px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )`,
      backdropFilter: "blur(20px) saturate(180%)",
      outline: "none",
      boxSizing: "border-box",
      color: "#1e293b",
      fontWeight: "500",
      boxShadow: "inset 0 2px 10px rgba(139, 92, 246, 0.05)",
    },
    textarea: {
      width: "100%",
      padding: "16px 20px",
      borderRadius: "18px",
      border: "2px solid rgba(139, 92, 246, 0.1)",
      fontSize: "16px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )`,
      backdropFilter: "blur(20px) saturate(180%)",
      outline: "none",
      resize: "none",
      boxSizing: "border-box",
      minHeight: "140px",
      color: "#1e293b",
      fontWeight: "500",
      boxShadow: "inset 0 2px 10px rgba(139, 92, 246, 0.05)",
    },
    inputIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b",
      transition: "all 0.3s ease",
      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    },
    buttonGroup: {
      display: "flex",
      gap: "20px",
      paddingTop: "20px",
    },
    primaryButton: {
      flex: 1,
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 25%, 
          #4f46e5 75%, 
          #3730a3 100%
        )`,
      backgroundSize: "200% 200%",
      color: "#ffffff",
      padding: "18px 28px",
      borderRadius: "18px",
      fontWeight: "700",
      fontSize: "17px",
      boxShadow: `
        0 10px 30px rgba(139, 92, 246, 0.3),
        0 0 60px rgba(99, 102, 241, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      border: "none",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    secondaryButton: {
      padding: "18px 28px",
      background: `
        linear-gradient(135deg, 
          #ef4444 0%, 
          #dc2626 50%, 
          #b91c1c 100%
        )`,
      backgroundSize: "200% 200%",
      color: "#ffffff",
      borderRadius: "18px",
      fontWeight: "700",
      fontSize: "17px",
      boxShadow: `
        0 10px 30px rgba(239, 68, 68, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      border: "none",
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    errorMessage: {
      marginTop: "20px",
      padding: "20px",
      background: `
        linear-gradient(135deg, 
          rgba(239, 68, 68, 0.1) 0%, 
          rgba(220, 38, 38, 0.05) 100%
        )`,
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "18px",
      color: "#1e293b",
      animation: "shake 0.5s ease-in-out",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
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
        )`,
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
        )`,
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
    },
    eventHeader: {
      marginBottom: "24px",
    },
    eventTitle: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "16px",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.05)",
      transition: "color 0.3s ease",
    },
    eventDescription: {
      color: "#64748b",
      marginBottom: "20px",
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
      gap: "8px",
      color: "#475569",
    },
    eventActions: {
      display: "flex",
      gap: "16px",
      marginTop: "24px",
    },
    actionButton: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 20px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "15px",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.15)",
    },
    editButton: {
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 100%
        )`,
      color: "#ffffff",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    deleteEventButton: {
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 100%
        )`,
      color: "#ffffff",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    participantsButton: {
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 100%
        )`,
      color: "#ffffff",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    sendMessageButton: {
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 100%
        )`,
      color: "#ffffff",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    messageSection: {
      marginTop: "28px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
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
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          input::placeholder, textarea::placeholder {
            color: #94a3b8;
            font-weight: 400;
          }
          
          input:focus, textarea:focus {
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
          
          .primary-button:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 
              0 15px 40px rgba(139, 92, 246, 0.4),
              0 0 80px rgba(99, 102, 241, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          
          @media (max-width: 768px) {
            .grid-two {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={styles.floatingElement1}></div>
      <div style={styles.floatingElement2}></div>
      <div style={styles.floatingElement3}></div>
      <div style={styles.floatingElement4}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <Sparkles size={40} />
              Event Management
              <Zap size={36} />
            </h1>
            <p style={styles.subtitle}>Create and manage your events with ease</p>
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

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>{editingEventId ? <Edit3 size={28} /> : <Plus size={28} />}</div>
            <h2 style={styles.cardTitle}>{editingEventId ? "Edit Event" : "Create New Event"}</h2>
          </div>

          <form onSubmit={handleAddOrUpdateEvent} style={styles.form}>
            <div style={styles.gridTwo} className="grid-two">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Event Title</label>
                <input
                  name="title"
                  placeholder="Enter event title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Location</label>
                <div style={styles.inputContainer}>
                  <MapPin style={styles.inputIcon} className="input-icon" size={20} />
                  <input
                    name="location"
                    placeholder="Event location"
                    value={eventData.location}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Event description"
                value={eventData.description}
                onChange={handleChange}
                required
                rows={4}
                style={styles.textarea}
              />
            </div>

            <div style={styles.gridTwo} className="grid-two">
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Date</label>
                <div style={styles.inputContainer}>
                  <Calendar style={styles.inputIcon} className="input-icon" size={20} />
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Time</label>
                <div style={styles.inputContainer}>
                  <Clock style={styles.inputIcon} className="input-icon" size={20} />
                  <input
                    type="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button"
                style={{
                  ...styles.primaryButton,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Processing..." : editingEventId ? "Update Event" : "Create Event"}
              </button>
              {editingEventId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEventId(null)
                    setEventData({ ...eventData, title: "", description: "", date: "", time: "", location: "" })
                  }}
                  style={styles.secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {error && <div style={styles.errorMessage}>{error}</div>}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <Calendar size={28} />
            </div>
            <h2 style={styles.cardTitle}>Your Event History</h2>
          </div>

          {myEvents.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Calendar size={48} color="#94a3b8" />
              </div>
              <p style={styles.emptyText}>No events found. Create your first event!</p>
            </div>
          ) : (
            <div style={styles.eventGrid}>
              {myEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="event-card"
                  style={{
                    ...styles.eventCard,
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div style={styles.eventHeader}>
                    <h4 style={styles.eventTitle}>{event.title}</h4>
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

                  <div style={styles.eventActions}>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="action-button"
                      style={{ ...styles.actionButton, ...styles.editButton }}
                    >
                      <Edit3 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="action-button"
                      style={{ ...styles.actionButton, ...styles.deleteEventButton }}
                    >
                      <Trash2 size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleViewParticipants(event.id)}
                      className="action-button"
                      style={{ ...styles.actionButton, ...styles.participantsButton }}
                    >
                      <Users size={18} />
                      View Participants
                    </button>
                  </div>

                  <div style={styles.messageSection}>
                    <label style={styles.label}>Send Message to Participants</label>
                    <textarea
                      placeholder="Enter message for registered participants"
                      value={messages[event.id] || ""}
                      onChange={(e) => handleMessageChange(event.id, e.target.value)}
                      rows={3}
                      style={styles.textarea}
                    />
                    <div style={{ ...styles.eventActions, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleSendMessage(event.id)}
                        className="action-button"
                        style={{ ...styles.actionButton, ...styles.sendMessageButton }}
                      >
                        <Send size={18} />
                        Send Message
                      </button>
                    </div>
                    {messageError && <div style={styles.errorMessage}>{messageError}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedAddEvent
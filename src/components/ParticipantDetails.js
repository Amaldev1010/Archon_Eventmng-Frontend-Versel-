"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Users, Mail, Phone, GraduationCap, Building, Calendar, ArrowLeft, User, Star } from "lucide-react"

const EnhancedParticipantDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef(null)

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
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setError("No access token found. Please log in.")
          setLoading(false)
          return
        }

        const res = await axios.get(`http://localhost:8000/api/participants/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!Array.isArray(res.data)) {
          console.warn("Unexpected response format:", res.data)
          setParticipants([])
        } else {
          setParticipants(res.data)
        }
        setLoading(false)
      } catch (err) {
        console.error("Error fetching participants:", err.response ? err.response.data : err.message)
        setError("Failed to load participants: " + (err.response ? JSON.stringify(err.response.data) : err.message))
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [id])

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
    // Aurora floating elements with professional theme
    floatingElement1: {
      position: "fixed",
      top: "12%",
      left: "4%",
      width: "105px",
      height: "105px",
      background: `
        radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
      `,
      borderRadius: "50%",
      animation: "auroraFloat 13s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15 + scrollY * 0.08}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(139, 92, 246, 0.15)",
    },
    floatingElement2: {
      position: "fixed",
      top: "30%",
      right: "6%",
      width: "85px",
      height: "85px",
      background: `
        radial-gradient(circle at 40% 60%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
      `,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      animation: "auroraMorph 17s ease-in-out infinite",
      transform: `translate(${mousePosition.x * 0.18}px, ${mousePosition.y * 0.18 + scrollY * 0.06}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(79, 70, 229, 0.15)",
    },
    floatingElement3: {
      position: "fixed",
      bottom: "18%",
      left: "8%",
      width: "125px",
      height: "125px",
      background: `
        radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 30% 70%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)
      `,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      animation: "auroraMorph 21s ease-in-out infinite reverse",
      transform: `translate(${mousePosition.x * 0.12}px, ${mousePosition.y * 0.12 + scrollY * 0.04}px)`,
      transition: "transform 0.2s ease-out",
      zIndex: 1,
      backdropFilter: "blur(3px)",
      border: "1px solid rgba(168, 85, 247, 0.15)",
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
      alignItems: "center",
      gap: "24px",
      marginBottom: "48px",
      animation: "fadeInUp 1s ease-out",
      transform: `translateY(${scrollY * 0.1}px)`,
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "14px 24px",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(248, 250, 252, 0.6) 100%
        )
      `,
      backdropFilter: "blur(20px)",
      color: "#1e293b",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      border: "1px solid rgba(139, 92, 246, 0.1)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "15px",
      fontWeight: "600",
    },
    headerContent: {
      flex: 1,
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
      animation: "slideUpScale 1s ease-out",
      transform: `translateY(${scrollY * 0.05}px)`,
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "32px",
    },
    cardHeaderLeft: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
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
    participantCount: {
      padding: "12px 20px",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.1) 0%, 
          rgba(99, 102, 241, 0.05) 100%
        )
      `,
      backdropFilter: "blur(15px)",
      borderRadius: "16px",
      border: "1px solid rgba(139, 92, 246, 0.1)",
    },
    countText: {
      color: "#1e293b",
      fontWeight: "600",
      fontSize: "15px",
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
    participantGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    participantCard: {
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
    },
    participantHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "24px",
    },
    avatar: {
      width: "64px",
      height: "64px",
      background: `
        linear-gradient(135deg, 
          #8b5cf6 0%, 
          #6366f1 25%, 
          #4f46e5 75%, 
          #3730a3 100%
        )
      `,
      backgroundSize: "200% 200%",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "22px",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
      flexShrink: 0,
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    participantInfo: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    participantName: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    nameText: {
      fontWeight: "700",
      color: "#1e293b",
      fontSize: "20px",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.05)",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "15px",
      color: "#475569",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.08) 0%, 
          rgba(99, 102, 241, 0.05) 100%
        )
      `,
      backdropFilter: "blur(15px)",
      padding: "12px 16px",
      borderRadius: "14px",
      border: "1px solid rgba(139, 92, 246, 0.1)",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.05)",
    },
    collegeInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "15px",
      color: "#475569",
      background: `
        linear-gradient(135deg, 
          rgba(139, 92, 246, 0.08) 0%, 
          rgba(99, 102, 241, 0.05) 100%
        )
      `,
      backdropFilter: "blur(15px)",
      padding: "12px 16px",
      borderRadius: "14px",
      border: "1px solid rgba(139, 92, 246, 0.1)",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.05)",
    },
    eventBadge: {
      marginTop: "20px",
      padding: "10px 20px",
      background: `
        linear-gradient(135deg, 
          #22c55e 0%, 
          #16a34a 100%
        )
      `,
      borderRadius: "16px",
      display: "inline-block",
      boxShadow: "0 8px 25px rgba(34, 197, 94, 0.3)",
    },
    badgeText: {
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "600",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
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
    errorContainer: {
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
    errorContent: {
      textAlign: "center",
      background: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(248, 250, 252, 0.9) 100%
        )
      `,
      backdropFilter: "blur(30px)",
      borderRadius: "28px",
      padding: "48px",
      border: "1px solid rgba(139, 92, 246, 0.1)",
      boxShadow: "0 20px 60px rgba(139, 92, 246, 0.1)",
    },
    errorIcon: {
      width: "140px",
      height: "140px",
      background: `
        linear-gradient(135deg, 
          rgba(239, 68, 68, 0.1) 0%, 
          rgba(220, 38, 38, 0.05) 100%
        )
      `,
      borderRadius: "50%",
      margin: "0 auto 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(239, 68, 68, 0.15)",
    },
    errorText: {
      color: "#1e293b",
      fontSize: "20px",
      marginBottom: "24px",
      fontWeight: "300",
      textShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
    },
    errorButton: {
      padding: "14px 28px",
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
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "15px",
      fontWeight: "600",
      animation: "gradientShift 3s ease-in-out infinite",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
  }

  if (loading) {
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
          <p style={styles.loadingText}>Loading participants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <div style={styles.errorIcon}>
            <Users size={48} color="rgba(239, 68, 68, 0.8)" />
          </div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => navigate(-1)} style={styles.errorButton}>
            Go Back
          </button>
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
          
          .participant-card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 25px 60px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.1);
          }
          
          .back-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(248, 250, 252, 0.8) 100%
            );
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
          }
          
          .error-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
          }
          
          @media (max-width: 768px) {
            .info-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      {/* Aurora Floating Elements */}
      <div style={styles.floatingElement1}></div>
      <div style={styles.floatingElement2}></div>
      <div style={styles.floatingElement3}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>
              <Users size={40} />
              Event Participants
              <Star size={32} />
            </h1>
            <p style={styles.subtitle}>View all registered participants for this event</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <div style={styles.cardIcon}>
                <Users size={28} />
              </div>
              <h2 style={styles.cardTitle}>Registered Participants</h2>
            </div>
            <div style={styles.participantCount}>
              <span style={styles.countText}>
                {participants.length} {participants.length === 1 ? "Participant" : "Participants"}
              </span>
            </div>
          </div>

          {participants.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Users size={48} color="#94a3b8" />
              </div>
              <p style={styles.emptyText}>No participants registered for this event yet.</p>
            </div>
          ) : (
            <div style={styles.participantGrid}>
              {participants.map((participant, index) => (
                <div
                  key={participant.id || index}
                  className="participant-card"
                  style={{
                    ...styles.participantCard,
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div style={styles.participantHeader}>
                    <div style={styles.avatar}>
                      {participant.name ? participant.name.charAt(0).toUpperCase() : <User size={28} />}
                    </div>
                    <div style={styles.participantInfo}>
                      <div style={styles.participantName}>
                        <User size={20} color="#64748b" />
                        <span style={styles.nameText}>{participant.name || "N/A"}</span>
                      </div>

                      <div style={styles.infoGrid} className="info-grid">
                        <div style={styles.infoItem}>
                          <Mail size={18} />
                          <span>{participant.email || "N/A"}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <Phone size={18} />
                          <span>{participant.phone_number || "N/A"}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <GraduationCap size={18} />
                          <span>{participant.department || "N/A"}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <Calendar size={18} />
                          <span>Year {participant.year_of_study || "N/A"}</span>
                        </div>
                      </div>

                      <div style={styles.collegeInfo}>
                        <Building size={18} />
                        <span>{participant.college_name || "N/A"}</span>
                      </div>

                      {participant.event_title && (
                        <div style={styles.eventBadge}>
                          <span style={styles.badgeText}>Event: {participant.event_title}</span>
                        </div>
                      )}
                    </div>
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

export default EnhancedParticipantDetails

import { Box, Container, Typography, Grid, Paper, Button, Divider } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FactoryIcon from "@mui/icons-material/Factory";
import { CheckCircleOutline, Timeline, Security, Support } from "@mui/icons-material";

export default function About() {
  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          py: { xs: 10, md: 15 },
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/unisew.jpg') center/cover",
            opacity: 0.1,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4rem" },
              letterSpacing: "-0.02em"
            }}
          >
            About UniSew
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.95,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
              mb: 4
            }}
          >
            Revolutionizing school uniform design and manufacturing with cutting-edge technology and unparalleled service excellence.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "white",
              color: "#1976d2",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "50px",
              textTransform: "none",
              boxShadow: "0 8px 32px rgba(255,255,255,0.3)",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(255,255,255,0.4)"
              }
            }}
          >
            Discover Our Services
          </Button>
        </Container>
      </Box>

      {/* Company Overview */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Box
                sx={{
                  height: { xs: 320, md: 380 },
                  width: '100%',
                  mx: "auto",
                  background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e1f5fe 100%)",
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(25, 118, 210, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                    borderRadius: "50%"
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    background: "radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, transparent 70%)",
                    borderRadius: "50%"
                  }
                }}
              >
                {/* Logo Icon */}
                <Box
                  sx={{
                    width: { xs: 60, md: 70 },
                    height: { xs: 60, md: 70 },
                    backgroundColor: "#1976d2",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: { xs: 2, md: 3 },
                    boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                    position: "relative",
                    zIndex: 1,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: 3,
                      background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      animation: "shimmer 3s infinite"
                    }
                  }}
                >
                  <SchoolIcon sx={{ fontSize: { xs: 30, md: 35 }, color: "white" }} />
                </Box>

                {/* Company Name */}
                <Typography
                  variant="h2"
                  sx={{
                    color: "#1976d2",
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "2.8rem" },
                    mb: { xs: 1, md: 2 },
                    position: "relative",
                    zIndex: 1,
                    letterSpacing: "-0.02em"
                  }}
                >
                  UniSew
                </Typography>

                {/* Tagline */}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 500,
                    fontSize: { xs: "0.8rem", md: "1rem" },
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                    opacity: 0.8,
                    px: 1
                  }}
                >
                  Uniform Excellence Platform
                </Typography>
              </Box>

              {/* Add shimmer animation */}
              <style>
                {`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                  }
                `}
              </style>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  color: "#1e293b",
                  fontSize: { xs: "2rem", md: "2.5rem" }
                }}
              >
                Our Mission & Vision
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  mb: 3,
                  fontSize: "1.1rem"
                }}
              >
                <strong>Mission:</strong> To democratize access to high-quality, custom-designed school uniforms by bridging the gap between educational institutions, creative designers, and skilled manufacturers through innovative technology.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  mb: 4,
                  fontSize: "1.1rem"
                }}
              >
                <strong>Vision:</strong> To become the global leader in educational uniform solutions, where every student worldwide has access to comfortable, durable, and identity-reflecting uniforms that enhance their school experience.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutline sx={{ color: "#22c55e", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                    Quality Assurance
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutline sx={{ color: "#22c55e", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                    Global Reach
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutline sx={{ color: "#22c55e", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                    Innovation Focus
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Key Features */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "#1e293b",
                fontSize: { xs: "2rem", md: "2.5rem" }
              }}
            >
              Why Schools Trust UniSew
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.6
              }}
            >
              We provide comprehensive solutions that address every aspect of school uniform needs, from concept to completion.
          </Typography>
          </Box>

                     <Grid container spacing={2} alignItems="stretch" sx={{ flexWrap: 'nowrap' }}>
             <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  textAlign: "center",
                  height: "100%",
                  minHeight: 240,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#1976d2"
                  },
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <SchoolIcon sx={{ fontSize: { xs: 40, md: 48 }, color: "#1976d2", mb: 1.5 }} />
                </Box>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#1e293b", fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    School-Centric Design
                </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.5, flex: 1, fontSize: { xs: "0.75rem", md: "0.8rem" } }}>
                    Customized platform specifically built for educational institutions with intuitive workflows and school-friendly features.
                </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  textAlign: "center",
                  height: "100%",
                  minHeight: 240,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#1976d2"
                  },
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <DesignServicesIcon sx={{ fontSize: { xs: 40, md: 48 }, color: "#1976d2", mb: 1.5 }} />
                </Box>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b", fontSize: { xs: "1rem", md: "1.2rem" } }}>
                    Advanced Design Tools
                </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, flex: 1, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                    Professional-grade design studio with real-time collaboration, 3D visualization, and extensive customization options.
                </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  height: "100%",
                  minHeight: 260,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#1976d2"
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <FactoryIcon sx={{ fontSize: { xs: 48, md: 56 }, color: "#1976d2", mb: 2 }} />
                </Box>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b", fontSize: { xs: "1rem", md: "1.2rem" } }}>
                    Premium Manufacturing
                </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, flex: 1, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                    Partnerships with certified manufacturers ensuring superior quality, ethical production, and on-time delivery.
                </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  height: "100%",
                  minHeight: 260,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#1976d2"
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Support sx={{ fontSize: { xs: 48, md: 56 }, color: "#1976d2", mb: 2 }} />
                </Box>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b", fontSize: { xs: "1rem", md: "1.2rem" } }}>
                    24/7 Support
                </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, flex: 1, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                    Dedicated customer success team providing comprehensive support throughout your entire uniform journey.
                </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: "#1e293b",
                fontSize: { xs: "2rem", md: "2.5rem" }
              }}
            >
              How UniSew Works
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                maxWidth: 700,
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.6
              }}
            >
              Our streamlined process ensures a seamless experience from initial design concept to final product delivery.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {[
              {
                step: "01",
                title: "Submit Design Request",
                description: "Schools submit their uniform requirements, including specifications, quantities, and design preferences through our intuitive platform.",
                icon: <SchoolIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              },
              {
                step: "02",
                title: "Designer Collaboration",
                description: "Professional designers create custom uniform designs based on your requirements, with real-time collaboration and feedback.",
                icon: <DesignServicesIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              },
              {
                step: "03",
                title: "Quality Manufacturing",
                description: "Approved designs are sent to our certified manufacturing partners who produce uniforms with the highest quality standards.",
                icon: <FactoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              },
              {
                step: "04",
                title: "Delivery & Support",
                description: "Completed uniforms are delivered to your school with full tracking support and post-delivery customer service.",
                icon: <CheckCircleOutline sx={{ fontSize: 40, color: "#1976d2" }} />
              }
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "flex-start",
                    height: "100%",
                    p: 3,
                    backgroundColor: "white",
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      borderColor: "#1976d2"
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      backgroundColor: "#e3f2fd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative"
                    }}
                  >
                    {item.icon}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: -6,
                        backgroundColor: "#1976d2",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        minWidth: 24,
                        textAlign: "center"
                      }}
                    >
                      {item.step}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#1976d2", color: "white" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: "center" }} justifyContent="center" alignItems="center">
            {[
              { number: "500+", label: "Schools Served", sublabel: "Across multiple countries" },
              { number: "50k+", label: "Uniforms Delivered", sublabel: "High-quality products" },
              { number: "98%", label: "Satisfaction Rate", sublabel: "Customer approval" },
              { number: "24/7", label: "Support Available", sublabel: "Always here to help" }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: 120
                }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: "2.2rem", md: "3.2rem" },
                      lineHeight: 1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: { xs: "1rem", md: "1.2rem" }
                  }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" sx={{
                    opacity: 0.85,
                    fontSize: { xs: "0.85rem", md: "0.9rem" }
                  }}>
                    {stat.sublabel}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#f8fafc", textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: "#1e293b",
              fontSize: { xs: "2rem", md: "2.5rem" }
            }}
          >
            Ready to Transform Your School Uniforms?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#64748b",
              mb: 4,
              fontSize: "1.1rem",
              lineHeight: 1.6
            }}
          >
            Join hundreds of schools worldwide who trust UniSew for their uniform needs.
            Get started today and experience the difference professional service makes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "50px",
                textTransform: "none",
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)"
                }
              }}
            >
              Start Your Project
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "50px",
                textTransform: "none",
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1976d2",
                  color: "white",
                  transform: "translateY(-2px)"
                }
              }}
            >
              Contact Our Team
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
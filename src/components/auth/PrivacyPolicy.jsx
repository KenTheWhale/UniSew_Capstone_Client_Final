import React from 'react';
import {Box, Container, List, ListItem, ListItemIcon, ListItemText, Paper, Typography} from '@mui/material';
import {ContactSupport, InfoOutlined, PersonOutline, Security, Share, Update} from '@mui/icons-material';

export default function PrivacyPolicy() {
    const sections = [
        {
            title: "Information We Collect",
            icon: <InfoOutlined />,
            content: "We may collect various types of information from you, including:",
            items: [
                "Personal information (e.g., name, email address, phone number) when you register for an account or use our services.",
                "Usage information (e.g., pages you visit, time you spend on our website) collected automatically.",
                "Device information (e.g., device type, operating system) to improve user experience."
            ]
        },
        {
            title: "How We Use Your Information",
            icon: <PersonOutline />,
            content: "We use the information we collect for the following purposes:",
            items: [
                "To provide and maintain our services.",
                "To improve, personalize, and expand our services.",
                "To understand and analyze how you use our services.",
                "To develop new products, services, features, and functionality.",
                "To communicate with you for customer service and marketing purposes.",
                "To send you emails and important updates.",
                "To find and prevent fraud."
            ]
        },
        {
            title: "Sharing Your Information",
            icon: <Share />,
            content: "We do not sell, trade, or rent Users' personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our partners, trusted affiliates and advertisers for the purposes outlined above."
        },
        {
            title: "Your Rights",
            icon: <Security />,
            content: "You have the right to access, rectify, or erase your personal information. You may also have the right to object to or restrict the processing of your data. Please contact us if you wish to exercise any of these rights."
        },
        {
            title: "Changes to This Privacy Policy",
            icon: <Update />,
            content: "We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page. You are advised to review this privacy policy periodically for any changes."
        },
        {
            title: "Contact Us",
            icon: <ContactSupport />,
            content: "If you have any questions about this privacy policy, please contact us:",
            contactInfo: {
                email: "support@unisew.com",
                phone: "+84 123 456 789"
            }
        }
    ];

    return (
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    py: { xs: 6, md: 10 },
                    color: "white",
                    textAlign: "center",
                    mb: { xs: 4, md: 8 }
                }}
            >
                <Container maxWidth="lg">
                    <Security sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            fontSize: { xs: "2.5rem", md: "3.5rem" },
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Privacy Policy
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            opacity: 0.95,
                            fontSize: { xs: "1.1rem", md: "1.3rem" },
                            maxWidth: 600,
                            mx: "auto",
                            lineHeight: 1.6
                        }}
                    >
                        Your privacy is important to us. Learn how we protect and handle your personal information.
                    </Typography>
                </Container>
            </Box>

            {/* Introduction */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 3,
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            mb: 3,
                            fontSize: { xs: "1.8rem", md: "2.2rem" }
                        }}
                    >
                        Welcome to UniSew
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#475569",
                            lineHeight: 1.8,
                            fontSize: "1.1rem"
                        }}
                    >
                        Welcome to our privacy policy. We are committed to protecting your personal information and being transparent about how we collect, use, and share your data. This policy explains how we handle your information when you use our uniform design and manufacturing services.
                    </Typography>
                </Paper>
            </Container>

            {/* Policy Sections */}
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {sections.map((section, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                borderRadius: 3,
                                border: "1px solid #e2e8f0",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#1976d2",
                                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.1)"
                                }
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: "50%",
                                        backgroundColor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 3
                                    }}
                                >
                                    {React.cloneElement(section.icon, { 
                                        sx: { color: "#1976d2", fontSize: 28 } 
                                    })}
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1e293b",
                                        fontSize: { xs: "1.3rem", md: "1.5rem" }
                                    }}
                                >
                                    {index + 1}. {section.title}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#475569",
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                    mb: section.items ? 3 : section.contactInfo ? 3 : 0
                                }}
                            >
                                {section.content}
                            </Typography>

                            {section.items && (
                                <List sx={{ pl: 2 }}>
                                    {section.items.map((item, itemIndex) => (
                                        <ListItem key={itemIndex} sx={{ pl: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#1976d2"
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item}
                                                sx={{
                                                    "& .MuiListItemText-primary": {
                                                        color: "#475569",
                                                        fontSize: "1.05rem",
                                                        lineHeight: 1.7
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {section.contactInfo && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600, color: "#1e293b", minWidth: 60 }}
                                            >
                                                Email:
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: "#1976d2", fontWeight: 500 }}
                                            >
                                                {section.contactInfo.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600, color: "#1e293b", minWidth: 60 }}
                                            >
                                                Phone:
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: "#1976d2", fontWeight: 500 }}
                                            >
                                                {section.contactInfo.phone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* Footer Notice */}
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 3,
                        textAlign: "center"
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#64748b",
                            lineHeight: 1.6,
                            fontSize: "0.95rem"
                        }}
                    >
                        This privacy policy is effective as of the date last updated above. We reserve the right to change this policy at any time. 
                        Please check this page periodically for updates.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
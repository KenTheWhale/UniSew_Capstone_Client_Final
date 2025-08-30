import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Fab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography,
    Zoom
} from '@mui/material';
import {
    Business as BusinessIcon,
    Description as DescriptionIcon,
    Email as EmailIcon,
    Gavel as GavelIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Payment as PaymentIcon,
    PrivacyTip as PrivacyIcon,
    School as SchoolIcon,
    Security as SecurityIcon
} from '@mui/icons-material';

const TermOfServices = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const termsData = {
        general: {
            title: "General Terms and Conditions",
            icon: <GavelIcon/>,
            content: [
                {
                    subtitle: "1. Acceptance of Terms",
                    text: "By accessing and using UniSew's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
                },
                {
                    subtitle: "2. Service Description",
                    text: "UniSew provides elementary school uniform design and manufacturing services, including custom design consultation, production, and delivery services."
                },
                {
                    subtitle: "3. Eligibility",
                    text: "You must be at least 18 years old or have parental consent to use our services. Schools and educational institutions are our primary customers."
                },
                {
                    subtitle: "4. Account Registration",
                    text: "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information."
                }
            ]
        },
        orders: {
            title: "Order and Payment Terms",
            icon: <PaymentIcon/>,
            content: [
                {
                    subtitle: "1. Order Process",
                    text: "All orders must be placed through our official channels. Verbal agreements are not binding until confirmed in writing."
                },
                {
                    subtitle: "2. Payment Terms",
                    text: "50% deposit is required upon contract signing. Remaining balance is due upon delivery. We accept bank transfers, VNPAY, and cash payments."
                },
                {
                    subtitle: "3. Pricing",
                    text: "All prices are quoted in Vietnamese Dong (VND) and are subject to change without notice. Final pricing is confirmed in the contract."
                },
                {
                    subtitle: "4. Cancellation Policy",
                    text: "Orders can be cancelled within 24 hours of placement. Cancellations after production begins may incur charges."
                }
            ]
        },
        production: {
            title: "Production and Quality",
            icon: <BusinessIcon/>,
            content: [
                {
                    subtitle: "1. Production Timeline",
                    text: "Production timelines are estimates and may vary based on order complexity and quantity. We will communicate any delays promptly."
                },
                {
                    subtitle: "2. Quality Standards",
                    text: "All products meet child safety standards and undergo quality control checks. We provide 6-month warranty for manufacturing defects."
                },
                {
                    subtitle: "3. Materials and Specifications",
                    text: "Materials and specifications are as agreed in the contract. Changes after production begins may incur additional costs."
                },
                {
                    subtitle: "4. Samples and Approvals",
                    text: "Physical samples can be provided at additional cost. Final approval is required before mass production."
                }
            ]
        },
        delivery: {
            title: "Delivery and Returns",
            icon: <SchoolIcon/>,
            content: [
                {
                    subtitle: "1. Delivery Service",
                    text: "Free nationwide delivery for orders over 100 pieces. Express delivery available at additional cost."
                },
                {
                    subtitle: "2. Delivery Timeline",
                    text: "Delivery timelines are estimates. We will provide tracking information when available."
                },
                {
                    subtitle: "3. Acceptance of Delivery",
                    text: "Inspect products upon delivery. Report any issues within 24 hours for immediate resolution."
                },
                {
                    subtitle: "4. Return Policy",
                    text: "Returns accepted for manufacturing defects within 30 days. Size exchanges available within 7 days."
                }
            ]
        },
        privacy: {
            title: "Privacy and Data Protection",
            icon: <PrivacyIcon/>,
            content: [
                {
                    subtitle: "1. Data Collection",
                    text: "We collect necessary information for order processing, including school details, contact information, and design preferences."
                },
                {
                    subtitle: "2. Data Usage",
                    text: "Your data is used solely for service provision and communication. We do not sell or share your information with third parties."
                },
                {
                    subtitle: "3. Data Security",
                    text: "We implement appropriate security measures to protect your personal information from unauthorized access."
                },
                {
                    subtitle: "4. Data Retention",
                    text: "We retain your data for as long as necessary to provide services and comply with legal obligations."
                }
            ]
        },
        intellectual: {
            title: "Intellectual Property",
            icon: <DescriptionIcon/>,
            content: [
                {
                    subtitle: "1. Design Ownership",
                    text: "Custom designs created for your school become your property upon full payment. UniSew retains rights to use designs for portfolio purposes."
                },
                {
                    subtitle: "2. Logo and Branding",
                    text: "You must have rights to any logos or branding elements provided. UniSew is not responsible for trademark violations."
                },
                {
                    subtitle: "3. Portfolio Rights",
                    text: "UniSew may use completed projects in our portfolio and marketing materials unless otherwise agreed in writing."
                },
                {
                    subtitle: "4. Confidentiality",
                    text: "We maintain confidentiality of your school's specific requirements and design preferences."
                }
            ]
        },
        liability: {
            title: "Liability and Disclaimers",
            icon: <SecurityIcon/>,
            content: [
                {
                    subtitle: "1. Service Limitations",
                    text: "UniSew provides services as described. We are not liable for indirect, incidental, or consequential damages."
                },
                {
                    subtitle: "2. Force Majeure",
                    text: "We are not liable for delays or failures due to circumstances beyond our control, including natural disasters or government actions."
                },
                {
                    subtitle: "3. Maximum Liability",
                    text: "Our maximum liability is limited to the amount paid for the specific order giving rise to the claim."
                },
                {
                    subtitle: "4. Indemnification",
                    text: "You agree to indemnify UniSew against claims arising from your use of our services or violation of these terms."
                }
            ]
        }
    };

    const renderSection = (sectionKey, sectionData) => {
        return (
            <Card key={sectionKey} sx={{mb: 3, boxShadow: 2}}>
                <CardContent sx={{p: 0}}>
                    <Box sx={{
                        p: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Box sx={{mr: 2, color: 'primary.main'}}>
                            {sectionData.icon}
                        </Box>
                        <Typography variant="h5" fontWeight="bold">
                            {sectionData.title}
                        </Typography>
                    </Box>

                    <Box sx={{p: 3}}>
                        {sectionData.content.map((item, index) => (
                            <Box key={index} sx={{mb: 3}}>
                                <Typography variant="h6" fontWeight="semibold" gutterBottom color="primary">
                                    {item.subtitle}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{lineHeight: 1.6}}>
                                    {item.text}
                                </Typography>
                                {index < sectionData.content.length - 1 && (
                                    <Divider sx={{mt: 2}}/>
                                )}
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const quickLinks = [
        {key: 'general', label: 'General Terms', icon: <GavelIcon/>},
        {key: 'orders', label: 'Orders & Payment', icon: <PaymentIcon/>},
        {key: 'production', label: 'Production', icon: <BusinessIcon/>},
        {key: 'delivery', label: 'Delivery', icon: <SchoolIcon/>},
        {key: 'privacy', label: 'Privacy', icon: <PrivacyIcon/>},
        {key: 'intellectual', label: 'Intellectual Property', icon: <DescriptionIcon/>},
        {key: 'liability', label: 'Liability', icon: <SecurityIcon/>}
    ];

    const scrollToSection = (sectionKey) => {
        const element = document.getElementById(`section-${sectionKey}`);
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    };

    return (
        <Box sx={{minHeight: '100vh', bgcolor: 'grey.50'}}>

            {}
            <Box sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                py: 8,
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Terms of Service
                    </Typography>
                    <Typography variant="h6" sx={{opacity: 0.9, mb: 4}}>
                        Please read these terms carefully before using UniSew's services
                    </Typography>
                    <Typography variant="body1" sx={{opacity: 0.8}}>
                        Last updated: August 2025
                    </Typography>
                </Container>
            </Box>

            {}
            <Paper elevation={1} sx={{position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white'}}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        py: 2,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {display: 'none'}
                    }}>
                        {quickLinks.map((link) => (
                            <Button
                                key={link.key}
                                variant="outlined"
                                size="small"
                                startIcon={link.icon}
                                onClick={() => scrollToSection(link.key)}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    borderRadius: 2,
                                    px: 2
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Box>
                </Container>
            </Paper>

            {}
            <Container maxWidth="lg" sx={{py: 6}}>
                {}
                <Card sx={{mb: 4, boxShadow: 2}}>
                    <CardContent sx={{p: 4}}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                            Introduction
                        </Typography>
                        <Typography variant="body1" paragraph sx={{lineHeight: 1.6}}>
                            Welcome to UniSew. These Terms of Service govern your use of our uniform design and
                            manufacturing services.
                            By using our services, you agree to these terms and our Privacy Policy.
                        </Typography>
                        <Typography variant="body1" sx={{lineHeight: 1.6}}>
                            These terms are legally binding and outline the rights and responsibilities of both UniSew
                            and our customers.
                            Please read them carefully and contact us if you have any questions.
                        </Typography>
                    </CardContent>
                </Card>

                {}
                {Object.entries(termsData).map(([key, data]) => (
                    <Box key={key} id={`section-${key}`}>
                        {renderSection(key, data)}
                    </Box>
                ))}

                {}
                <Card sx={{mt: 4, boxShadow: 2}}>
                    <CardContent sx={{p: 4}}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                            Contact Information
                        </Typography>
                        <Typography variant="body1" paragraph>
                            If you have any questions about these Terms of Service, please contact us:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <EmailIcon color="primary"/>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Email"
                                    secondary="unisewsu2025@gmail.com"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <SchoolIcon color="primary"/>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Phone"
                                    secondary="0939-674-767"
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {}
                <Box sx={{mt: 4, textAlign: 'center'}}>
                    <Typography variant="h6" gutterBottom>
                        By using our services, you acknowledge that you have read, understood, and agree to these Terms
                        of Service.
                    </Typography>
                    <Chip
                        label="Terms of Service Accepted"
                        color="primary"
                        variant="outlined"
                        sx={{mt: 2}}
                    />
                </Box>
            </Container>

            {}


            {}
            <Zoom in={showScrollTop}>
                <Fab
                    color="primary"
                    size="medium"
                    onClick={scrollToTop}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000
                    }}
                >
                    <KeyboardArrowUpIcon/>
                </Fab>
            </Zoom>
        </Box>
    );
};

export default TermOfServices;

import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Fab,
    Grid,
    Paper,
    TextField,
    Typography,
    Zoom
} from '@mui/material';
import {
    Email as EmailIcon,
    ExpandMore as ExpandMoreIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    LocalShipping as ShippingIcon,
    Palette as PaletteIcon,
    School as SchoolIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const UniSewFAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('design');
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

    const faqData = {
        design: [
            {
                question: "Does UniSew support custom uniform design according to specific requirements?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            Yes, we fully support custom uniform design according to each school's specific
                            requirements. Our professional design team will work directly with your school to create
                            unique uniform designs that match your school's culture and values.
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Our services include:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2">Free design consultation</Typography>
                            <Typography component="li" variant="body2">Color, logo, and slogan
                                customization</Typography>
                            <Typography component="li" variant="body2">Multiple design versions for
                                selection</Typography>

                        </Box>
                    </Box>
                )
            },
            {
                question: "How can I preview the design before placing an order?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            UniSew provides multiple ways for customers to preview designs:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2">
                                <strong>3D Mockup:</strong> View designs on vivid 3D models
                            </Typography>
                            <Typography component="li" variant="body2">
                                <strong>Detailed design files:</strong> Technical drawings with complete specifications
                            </Typography>
                        </Box>
                    </Box>
                )
            },
            {
                question: "What colors and materials does UniSew offer?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            <strong>Colors:</strong> We have a rich color palette with over 50 basic colors and can mix
                            custom colors according to school requirements.
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Materials:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2">
                                <strong>100% Cotton:</strong> Breathable, good absorption, suitable for tropical climate
                            </Typography>
                            <Typography component="li" variant="body2">
                                <strong>Cotton-Polyester blend:</strong> Color-fast, wrinkle-resistant, easy to wash and
                                iron
                            </Typography>
                            <Typography component="li" variant="body2">
                                <strong>Kate fabric:</strong> Durable and beautiful, maintains shape well, suitable for
                                long-term uniforms
                            </Typography>
                            <Typography component="li" variant="body2">
                                <strong>Stretch knit fabric:</strong> Comfortable for movement, suitable for PE uniforms
                            </Typography>
                        </Box>
                    </Box>
                )
            }
        ],
        production: [
            {
                question: "What is the production process for uniforms at UniSew?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            UniSew's professional production process includes 7 steps:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Step 1:</strong> Receive order and
                                confirm design</Typography>
                            <Typography component="li" variant="body2"><strong>Step 2:</strong> Cut fabric according to
                                approved patterns</Typography>
                            <Typography component="li" variant="body2"><strong>Step 3:</strong> Sew first sample for
                                inspection</Typography>
                            <Typography component="li" variant="body2"><strong>Step 4:</strong> Mass production with
                                modern machinery</Typography>
                            <Typography component="li" variant="body2"><strong>Step 5:</strong> Quality check each
                                product</Typography>
                            <Typography component="li" variant="body2"><strong>Step 6:</strong> Print/embroider logos
                                and school names as required</Typography>
                            <Typography component="li" variant="body2"><strong>Step 7:</strong> Package and prepare for
                                delivery</Typography>
                        </Box>
                    </Box>
                )
            },
            {
                question: "How does UniSew ensure product quality?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            We have a strict quality control system:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Material inspection:</strong> Every meter
                                of fabric is checked before use</Typography>
                            <Typography component="li" variant="body2"><strong>Production monitoring:</strong> Close
                                supervision of every process</Typography>
                            <Typography component="li" variant="body2"><strong>Certification:</strong> Products meet
                                child safety standards</Typography>
                        </Box>
                    </Box>
                )
            },
            {
                question: "Are the uniforms durable and color-fast?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            UniSew uniforms are designed for long-term use with features:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Fade-resistant fabric:</strong> Using
                                premium dyeing technology, colors remain vibrant after multiple washes</Typography>
                            <Typography component="li" variant="body2"><strong>Strong stitching:</strong> Using
                                high-quality thread, double-needle stitching for durability</Typography>
                        </Box>
                    </Box>
                )
            }
        ],
        order: [
            {
                question: "What is the ordering process at UniSew?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            Simple and transparent ordering process:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Step 1:</strong> Contact for consultation
                                via hotline 0939-674-767 or email</Typography>
                            <Typography component="li" variant="body2"><strong>Step 2:</strong> Discuss design,
                                materials, and quantities</Typography>
                            <Typography component="li" variant="body2"><strong>Step 3:</strong> Receive detailed
                                quotation and production timeline</Typography>
                            <Typography component="li" variant="body2"><strong>Step 5:</strong> Confirm sample and begin
                                production</Typography>
                            <Typography component="li" variant="body2"><strong>Step 6:</strong> Pay remaining balance
                                upon delivery</Typography>
                        </Box>
                    </Box>
                )
            },
            {
                question: "How long does production and delivery take?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            Timeline depends on order quantity and complexity:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>50-200 pieces:</strong> 7-10 business
                                days (estimated)</Typography>
                            <Typography component="li" variant="body2"><strong>200-500 pieces:</strong> 10-15 business
                                days (estimated)</Typography>
                            <Typography component="li" variant="body2"><strong>500-1000 pieces:</strong> 15-20 business
                                days (estimated)</Typography>
                            <Typography component="li" variant="body2"><strong>Over 1000 pieces:</strong> 20-25 business
                                days (estimated)</Typography>
                        </Box>
                        <Typography variant="body1" sx={{mt: 2}}>
                            <strong>Delivery:</strong> Free nationwide delivery for orders over 100 pieces. Express
                            delivery within 1-3 days.
                        </Typography>
                    </Box>
                )
            },
            {
                question: "What is the minimum order quantity?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            UniSew flexibly serves all needs:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Small orders:</strong> From 20 pieces
                                (suitable for small classes)</Typography>
                            <Typography component="li" variant="body2"><strong>Medium orders:</strong> 50-300 pieces
                                (suitable for elementary schools)</Typography>
                            <Typography component="li" variant="body2"><strong>Large orders:</strong> Over 300 pieces
                                (best pricing available)</Typography>
                        </Box>
                        <Typography variant="body1" sx={{mt: 2}}>
                            <strong>Note:</strong> Larger orders receive better unit pricing and more complimentary
                            services.
                        </Typography>
                    </Box>
                )
            },
            {
                question: "What are the exchange, return, and warranty policies?",
                answer: (
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Exchange and Return Policy:
                        </Typography>
                        <Box component="ul" sx={{pl: 2, mb: 2}}>
                            <Typography component="li" variant="body2">Free size exchange if sizing is
                                incorrect</Typography>
                            <Typography component="li" variant="body2">Exchange for manufacturing defects </Typography>
                            <Typography component="li" variant="body2">Size adjustment support for growing students
                                (reasonable fee applies)</Typography>
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Warranty:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2">Repair support at preferential rates</Typography>
                            <Typography component="li" variant="body2">Care consultation to maintain uniform
                                longevity</Typography>
                        </Box>
                    </Box>
                )
            },
            {
                question: "What payment methods does UniSew accept?",
                answer: (
                    <Box>
                        <Typography variant="body1" paragraph>
                            UniSew supports various convenient payment methods:
                        </Typography>
                        <Box component="ul" sx={{pl: 2}}>
                            <Typography component="li" variant="body2"><strong>Bank
                                transfer:</strong> VNPAY</Typography>
                            <Typography component="li" variant="body2"><strong>Cash on delivery (COD):</strong> For
                                small orders under 50 pieces</Typography>
                            <Typography component="li" variant="body2"><strong>Cash:</strong> At showroom or upon
                                delivery</Typography>
                        </Box>
                    </Box>
                )
            }
        ]
    };

    const categories = [
        {
            icon: <PaletteIcon/>,
            title: "Design & Customization",
            description: "Information about design process, color customization, logos, and uniform styles",
            key: "design"
        },
        {
            icon: <SchoolIcon/>,
            title: "Production & Quality",
            description: "Details about fabric materials, production process, and quality standards",
            key: "production"
        },
        {
            icon: <ShippingIcon/>,
            title: "Orders & Delivery",
            description: "Order guidance, payment, delivery time, and exchange/return policies",
            key: "order"
        }
    ];

    const filteredFAQs = (categoryKey) => {
        const questions = faqData[categoryKey];
        if (!searchQuery.trim()) return questions;

        return questions.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderFAQSection = (categoryKey, title, icon) => {
        const questions = filteredFAQs(categoryKey);

        return (
            <Card key={categoryKey} sx={{mb: 3, boxShadow: 2}}>
                <CardContent sx={{p: 0}}>
                    <Box sx={{
                        p: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Box sx={{mr: 2, color: 'primary.main'}}>
                                {icon}
                            </Box>
                            <Typography variant="h5" fontWeight="bold">
                                {title}
                            </Typography>
                        </Box>
                        <Chip
                            label={`${questions.length} questions`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    </Box>

                    {questions.length === 0 ? (
                        <Box sx={{p: 4, textAlign: 'center'}}>
                            <Typography variant="body2" color="text.secondary">
                                No questions match your search in this section.
                            </Typography>
                        </Box>
                    ) : (
                        questions.map((faq, index) => (
                            <Accordion key={index} sx={{boxShadow: 'none', borderBottom: 1, borderColor: 'divider'}}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {faq.question}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{pt: 0}}>
                                    {faq.answer}
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{minHeight: '100vh', bgcolor: 'grey.50'}}>
            {}

            {}
            <Box sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                py: 8,
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Frequently Asked Questions
                    </Typography>
                    <Typography variant="h6" sx={{opacity: 0.9, mb: 4}}>
                        Everything you need to know about UniSew's elementary school uniform design and manufacturing
                        services
                    </Typography>

                    {}
                    <Box sx={{maxWidth: 500, mx: 'auto'}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search questions (e.g. delivery, design, payment)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{mr: 1, color: 'text.secondary'}}/>,
                                sx: {
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        border: 'none'
                                    }
                                }
                            }}
                        />
                    </Box>
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
                        {categories.map((category) => (
                            <Button
                                key={category.key}
                                variant={activeCategory === category.key ? "contained" : "outlined"}
                                startIcon={category.icon}
                                onClick={() => setActiveCategory(category.key)}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    borderRadius: 2,
                                    px: 3
                                }}
                            >
                                {category.title}
                            </Button>
                        ))}
                    </Box>
                </Container>
            </Paper>

            {}
            <Container maxWidth="lg" sx={{py: 6}}>
                {}
                <Grid container spacing={3} sx={{mb: 6}}>
                    {categories.map((category, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                                onClick={() => setActiveCategory(category.key)}
                            >
                                <CardContent sx={{textAlign: 'center', p: 4}}>
                                    <Box sx={{
                                        color: 'primary.main',
                                        fontSize: 48,
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        {category.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {category.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {category.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {}
                {renderFAQSection(activeCategory,
                    categories.find(c => c.key === activeCategory)?.title || '',
                    categories.find(c => c.key === activeCategory)?.icon
                )}
            </Container>

            {}
            <Box sx={{
                background: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
                color: 'white',
                py: 8,
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Still Have Questions?
                    </Typography>
                    <Typography variant="h6" sx={{opacity: 0.9, mb: 4}}>
                        UniSew's consultation team is always ready to support you 24/7
                    </Typography>
                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap'}}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<EmailIcon/>}
                            href="mailto:unisewsu2025@gmail.com"
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5
                            }}
                        >
                            Email Consultation
                        </Button>

                    </Box>
                </Container>
            </Box>

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

export default UniSewFAQ;
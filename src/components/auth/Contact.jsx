import {Box, Button, Card, CardContent, Container, Grid, Paper, TextField, Typography} from '@mui/material';
import {ContactSupport, Email, LocationOn, Phone, Send} from '@mui/icons-material';

export default function Contact() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted');
    };

    return (
        <Box sx={{backgroundColor: '#fafafa', minHeight: '100vh'}}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    py: {xs: 8, md: 12},
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
                <Container maxWidth="lg" sx={{position: "relative", zIndex: 1}}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            fontSize: {xs: "2.5rem", md: "3.5rem"},
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Liên Hệ Với Chúng Tôi
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            opacity: 0.95,
                            fontSize: {xs: "1.1rem", md: "1.3rem"},
                            maxWidth: 600,
                            mx: "auto",
                            lineHeight: 1.6
                        }}
                    >
                        Sẵn sàng thay đổi trải nghiệm đồng phục của trường học? Hãy bắt đầu cuộc trò chuyện.
                    </Typography>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth={false} sx={{width: '80vw', py: {xs: 6, md: 10}}}>
                <Grid container spacing={3} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    {/* Section Header */}
                    <Grid item xs={12}>
                        <Box sx={{textAlign: "center", mb: 8}}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    mb: 2,
                                    fontSize: {xs: "1.8rem", md: "2.2rem"}
                                }}
                            >
                                Kết Nối Với Chúng Tôi
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#64748b",
                                    lineHeight: 1.6,
                                    fontSize: "1.1rem",
                                    maxWidth: 600,
                                    mx: "auto"
                                }}
                            >
                                Có câu hỏi về dịch vụ thiết kế đồng phục của chúng tôi? Chúng tôi ở đây để giúp bạn tạo
                                ra những bộ đồng phục hoàn hảo cho trường học.
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Contact Cards in 3 columns */}
                    <Grid item xs={12}>
                        <Grid container spacing={3} justifyContent="center" sx={{display: 'flex', flexDirection: 'row', flexWrap: 'nowrap'}}>
                            <Grid item sx={{flex: 1, maxWidth: 350}}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        height: 280,
                                        width: "100%",
                                        "&:hover": {
                                            borderColor: "#1976d2",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                        }
                                    }}
                                >
                                    <CardContent sx={{
                                        p: 4,
                                        textAlign: "center",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center"
                                    }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: "50%",
                                                backgroundColor: "#e3f2fd",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mx: "auto",
                                                mb: 3
                                            }}
                                        >
                                            <LocationOn sx={{color: "#1976d2", fontSize: 36}}/>
                                        </Box>
                                        <Typography variant="h6" sx={{fontWeight: 600, color: "#1e293b", mb: 1.5}}>
                                            Ghé Thăm Văn Phòng
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#64748b", mb: 2}}>
                                            Trụ Sở Chính UniSew
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#475569", lineHeight: 1.6}}>
                                            123 Đường Đổi Mới<br/>
                                            Quận Công Nghệ, San Francisco<br/>
                                            CA 94102, Hoa Kỳ
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item sx={{flex: 1, maxWidth: 350}}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        height: 280,
                                        width: "100%",
                                        "&:hover": {
                                            borderColor: "#1976d2",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                        }
                                    }}
                                >
                                    <CardContent sx={{
                                        p: 4,
                                        textAlign: "center",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center"
                                    }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: "50%",
                                                backgroundColor: "#e8f5e9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mx: "auto",
                                                mb: 3
                                            }}
                                        >
                                            <Email sx={{color: "#2e7d32", fontSize: 36}}/>
                                        </Box>
                                        <Typography variant="h6" sx={{fontWeight: 600, color: "#1e293b", mb: 1.5}}>
                                            Gửi Email
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#64748b", mb: 2}}>
                                            Chúng tôi sẽ phản hồi trong vòng 24 giờ
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#475569", lineHeight: 1.6}}>
                                            hello@unisew.com<br/>
                                            support@unisew.com<br/>
                                            partnerships@unisew.com
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item sx={{flex: 1, maxWidth: 350}}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        height: 280,
                                        width: "100%",
                                        "&:hover": {
                                            borderColor: "#1976d2",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                        }
                                    }}
                                >
                                    <CardContent sx={{
                                        p: 4,
                                        textAlign: "center",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center"
                                    }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: "50%",
                                                backgroundColor: "#fff3e0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mx: "auto",
                                                mb: 3
                                            }}
                                        >
                                            <Phone sx={{color: "#f57c00", fontSize: 36}}/>
                                        </Box>
                                        <Typography variant="h6" sx={{fontWeight: 600, color: "#1e293b", mb: 1.5}}>
                                            Gọi Điện
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#64748b", mb: 2}}>
                                            Giờ làm việc: 9AM - 6PM
                                        </Typography>
                                        <Typography variant="body2" sx={{color: "#475569", lineHeight: 1.6}}>
                                            +1 (555) 123-4567<br/>
                                            +1 (555) 987-6543<br/>
                                            Toll-free: 1-800-UNISEW
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Contact Form */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: {xs: 4, md: 6},
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                                backgroundColor: "white",
                                height: "100%"
                            }}
                        >
                            <Box sx={{mb: 4}}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1e293b",
                                        mb: 2,
                                        fontSize: {xs: "1.8rem", md: "2.2rem"}
                                    }}
                                >
                                    Gửi Tin Nhắn Cho Chúng Tôi
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#64748b",
                                        lineHeight: 1.6,
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    Hãy cho chúng tôi biết về dự án của bạn và chúng tôi sẽ liên hệ lại với giải pháp
                                    tùy chỉnh cho nhu cầu đồng phục của trường học.
                                </Typography>
                            </Box>

                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Họ và Tên"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2"
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2"
                                                    }
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#1976d2"
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Địa Chỉ Email"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            type="email"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2"
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2"
                                                    }
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#1976d2"
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tên Trường Học"
                                            variant="outlined"
                                            fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2"
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2"
                                                    }
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#1976d2"
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Số Điện Thoại"
                                            variant="outlined"
                                            fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2"
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2"
                                                    }
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#1976d2"
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    label="Tiêu Đề"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                                borderColor: "#1976d2"
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1976d2"
                                            }
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            color: "#1976d2"
                                        }
                                    }}
                                />

                                <TextField
                                    label="Hãy cho chúng tôi biết về dự án đồng phục của bạn..."
                                    variant="outlined"
                                    fullWidth
                                    required
                                    multiline
                                    rows={6}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                                borderColor: "#1976d2"
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1976d2"
                                            }
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            color: "#1976d2"
                                        }
                                    }}
                                />

                                <Box sx={{mt: 2}}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={<Send/>}
                                        sx={{
                                            backgroundColor: "#1976d2",
                                            color: "white",
                                            px: 4,
                                            py: 1.5,
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            borderRadius: "50px",
                                            textTransform: "none",
                                            boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
                                            "&:hover": {
                                                backgroundColor: "#1565c0",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 8px 25px rgba(25, 118, 210, 0.4)"
                                            }
                                        }}
                                    >
                                        Gửi Tin Nhắn
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* FAQ Section */}
            <Box sx={{py: {xs: 6, md: 10}, backgroundColor: "white", width: '100%'}}>
                <Container maxWidth={false} sx={{width: '80vw'}}>
                    <Box sx={{textAlign: "center", mb: 6}}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                mb: 3,
                                color: "#1e293b",
                                fontSize: {xs: "2rem", md: "2.5rem"}
                            }}
                        >
                            Câu Hỏi Thường Gặp
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
                            Nhận câu trả lời nhanh cho các câu hỏi thường gặp về dịch vụ thiết kế và sản xuất đồng phục
                            của chúng tôi.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                question: "Quy trình thiết kế mất bao lâu?",
                                answer: "Quy trình thiết kế thông thường của chúng tôi mất 3-5 ngày làm việc từ tư vấn ban đầu đến phê duyệt thiết kế cuối cùng, tùy thuộc vào độ phức tạp và số lần chỉnh sửa cần thiết."
                            },
                            {
                                question: "Số lượng đặt hàng tối thiểu là bao nhiêu?",
                                answer: "Chúng tôi làm việc với các trường học mọi quy mô. Số lượng đặt hàng tối thiểu là 50 bộ cho mỗi thiết kế, nhưng chúng tôi linh hoạt dựa trên nhu cầu cụ thể của trường học."
                            },
                            {
                                question: "Bạn có cung cấp mẫu vải không?",
                                answer: "Có! Chúng tôi cung cấp mẫu vải thực tế và bảng màu trước khi bắt đầu sản xuất để đảm bảo bạn hoàn toàn hài lòng với chất lượng vật liệu."
                            },
                            {
                                question: "Bạn có thể làm việc với thiết kế đồng phục hiện có của chúng tôi không?",
                                answer: "Tuyệt đối! Chúng tôi có thể làm việc với thiết kế hiện có của bạn, thực hiện chỉnh sửa hoặc tạo ra thiết kế hoàn toàn mới dựa trên sở thích của bạn."
                            }
                        ].map((faq, index) => (
                            <Grid item xs={12} md={6} key={index} sx={{width: '100%'}}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 3,
                                        height: "100%",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            borderColor: "#1976d2",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                                        }
                                    }}
                                >
                                    <Box sx={{display: "flex", alignItems: "flex-start", gap: 2}}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                backgroundColor: "#e3f2fd",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0
                                            }}
                                        >
                                            <ContactSupport sx={{color: "#1976d2", fontSize: 24}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{fontWeight: 600, mb: 1, color: "#1e293b"}}>
                                                {faq.question}
                                            </Typography>
                                            <Typography variant="body1" sx={{color: "#64748b", lineHeight: 1.6}}>
                                                {faq.answer}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
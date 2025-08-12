import {Box, Button, Container, Grid, Paper, Typography} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FactoryIcon from "@mui/icons-material/Factory";
import {CheckCircleOutline, Support} from "@mui/icons-material";

export default function About() {
    return (
        <Box sx={{backgroundColor: '#fafafa'}}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    py: {xs: 10, md: 15},
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
                        variant="h1"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            fontSize: {xs: "2.5rem", md: "4rem"},
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Về UniSew
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            opacity: 0.95,
                            fontSize: {xs: "1.1rem", md: "1.3rem"},
                            maxWidth: 600,
                            mx: "auto",
                            lineHeight: 1.6,
                            mb: 4
                        }}
                    >
                        Cách mạng hóa thiết kế và sản xuất đồng phục trường học với công nghệ tiên tiến và dịch vụ xuất
                        sắc vượt trội.
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
                        Khám Phá Dịch Vụ
                    </Button>
                </Container>
            </Box>

            {/* Company Overview */}
            <Box sx={{py: {xs: 8, md: 12}, backgroundColor: "white"}}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        
                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    mb: 4,
                                    color: "#1e293b",
                                    fontSize: {xs: "2rem", md: "2.5rem"}
                                }}
                            >
                                Sứ Mệnh & Tầm Nhìn
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
                                <strong>Sứ mệnh:</strong> Dân chủ hóa việc tiếp cận đồng phục trường học chất lượng cao,
                                thiết kế tùy chỉnh bằng cách kết nối các tổ chức giáo dục, nhà thiết kế sáng tạo và nhà
                                sản xuất lành nghề thông qua công nghệ đổi mới.
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
                                <strong>Tầm nhìn:</strong> Trở thành nhà lãnh đạo hàng đầu tại Việt Nam trong giải pháp đồng phục
                                giáo dục, nơi mọi học sinh Việt Nam đều có thể tiếp cận đồng phục thoải mái, bền bỉ
                                và phản ánh bản sắc, giúp nâng cao trải nghiệm học tập.
                            </Typography>
                            <Box sx={{display: "flex", gap: 2, flexWrap: "wrap"}}>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <CheckCircleOutline sx={{color: "#22c55e", fontSize: 20}}/>
                                    <Typography variant="body2" sx={{color: "#475569", fontWeight: 500}}>
                                        Đảm Bảo Chất Lượng
                                    </Typography>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <CheckCircleOutline sx={{color: "#22c55e", fontSize: 20}}/>
                                    <Typography variant="body2" sx={{color: "#475569", fontWeight: 500}}>
                                        Phạm Vi Toàn Quốc
                                    </Typography>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <CheckCircleOutline sx={{color: "#22c55e", fontSize: 20}}/>
                                    <Typography variant="body2" sx={{color: "#475569", fontWeight: 500}}>
                                        Tập Trung Đổi Mới
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Key Features */}
            <Box sx={{py: {xs: 8, md: 12}, backgroundColor: "#f8fafc"}}>
                <Container maxWidth="lg">
                    <Box sx={{textAlign: "center", mb: 8}}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                mb: 3,
                                color: "#1e293b",
                                fontSize: {xs: "2rem", md: "2.5rem"}
                            }}
                        >
                            Tại Sao Trường Học Tin Tưởng UniSew
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
                            Chúng tôi cung cấp giải pháp toàn diện giải quyết mọi khía cạnh nhu cầu đồng phục trường
                            học, từ ý tưởng đến hoàn thành.
                        </Typography>
                    </Box>

                    <Grid container spacing={2} alignItems="stretch"
                          sx={{display: 'flex', flexDirection: 'row', flexWrap: 'nowrap'}}>
                        <Grid item sx={{flex: 1}}>
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
                                <Box sx={{mb: 1.5}}>
                                    <SchoolIcon sx={{fontSize: {xs: 40, md: 48}, color: "#1976d2", mb: 1.5}}/>
                                </Box>
                                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: "#1e293b",
                                        fontSize: {xs: "0.9rem", md: "1rem"}
                                    }}>
                                        Thiết Kế Tập Trung Trường Học
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: "#64748b",
                                        lineHeight: 1.5,
                                        flex: 1,
                                        fontSize: {xs: "0.75rem", md: "0.8rem"}
                                    }}>
                                        Nền tảng tùy chỉnh được xây dựng đặc biệt cho các tổ chức giáo dục với quy trình
                                        làm việc trực quan và tính năng thân thiện với trường học.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item sx={{flex: 1}}>
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
                                <Box sx={{mb: 1.5}}>
                                    <DesignServicesIcon sx={{fontSize: {xs: 40, md: 48}, color: "#1976d2", mb: 1.5}}/>
                                </Box>
                                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        mb: 1.5,
                                        color: "#1e293b",
                                        fontSize: {xs: "1rem", md: "1.2rem"}
                                    }}>
                                        Công Cụ Thiết Kế Nâng Cao
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: "#64748b",
                                        lineHeight: 1.6,
                                        flex: 1,
                                        fontSize: {xs: "0.85rem", md: "0.9rem"}
                                    }}>
                                        Studio thiết kế chuyên nghiệp với cộng tác thời gian thực, hình ảnh 3D và nhiều
                                        tùy chọn tùy chỉnh.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item sx={{flex: 1}}>
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
                                <Box sx={{mb: 1.5}}>
                                    <FactoryIcon sx={{fontSize: {xs: 48, md: 56}, color: "#1976d2", mb: 2}}/>
                                </Box>
                                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        mb: 1.5,
                                        color: "#1e293b",
                                        fontSize: {xs: "1rem", md: "1.2rem"}
                                    }}>
                                        Sản Xuất Cao Cấp
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: "#64748b",
                                        lineHeight: 1.6,
                                        flex: 1,
                                        fontSize: {xs: "0.85rem", md: "0.9rem"}
                                    }}>
                                        Đối tác với các nhà sản xuất được chứng nhận đảm bảo chất lượng vượt trội, sản
                                        xuất có đạo đức và giao hàng đúng hạn.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item sx={{flex: 1}}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
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
                                <Box sx={{mb: 1.5}}>
                                    <Support sx={{fontSize: {xs: 48, md: 56}, color: "#1976d2", mb: 2}}/>
                                </Box>
                                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        mb: 1.5,
                                        color: "#1e293b",
                                        fontSize: {xs: "1rem", md: "1.2rem"}
                                    }}>
                                        Hỗ Trợ 24/7
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: "#64748b",
                                        lineHeight: 1.6,
                                        flex: 1,
                                        fontSize: {xs: "0.85rem", md: "0.9rem"}
                                    }}>
                                        Đội ngũ thành công khách hàng chuyên dụng cung cấp hỗ trợ toàn diện trong suốt
                                        hành trình đồng phục của bạn.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* How It Works */}
            <Box sx={{py: {xs: 8, md: 12}, backgroundColor: "white"}}>
                <Container maxWidth="lg">
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
                            UniSew Hoạt Động Như Thế Nào
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
                            Quy trình tối ưu của chúng tôi đảm bảo trải nghiệm mượt mà từ ý tưởng thiết kế ban đầu đến
                            giao sản phẩm cuối cùng.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} alignItems="stretch"
                          sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        {[
                            {
                                step: "01",
                                title: "Gửi Yêu Cầu Thiết Kế",
                                description: "Các trường học gửi yêu cầu đồng phục, bao gồm thông số kỹ thuật, số lượng và sở thích thiết kế thông qua nền tảng trực quan của chúng tôi.",
                                icon: <SchoolIcon sx={{fontSize: 40, color: "#1976d2"}}/>
                            },
                            {
                                step: "02",
                                title: "Cộng Tác Nhà Thiết Kế",
                                description: "Các nhà thiết kế chuyên nghiệp tạo ra thiết kế đồng phục tùy chỉnh dựa trên yêu cầu của bạn, với cộng tác thời gian thực và phản hồi.",
                                icon: <DesignServicesIcon sx={{fontSize: 40, color: "#1976d2"}}/>
                            },
                            {
                                step: "03",
                                title: "Sản Xuất Chất Lượng",
                                description: "Các thiết kế được phê duyệt được gửi đến các đối tác sản xuất được chứng nhận của chúng tôi, những người sản xuất đồng phục với tiêu chuẩn chất lượng cao nhất.",
                                icon: <FactoryIcon sx={{fontSize: 40, color: "#1976d2"}}/>
                            },
                            {
                                step: "04",
                                title: "Giao Hàng & Hỗ Trợ",
                                description: "Đồng phục hoàn thành được giao đến trường học của bạn với hỗ trợ theo dõi đầy đủ và dịch vụ khách hàng sau giao hàng.",
                                icon: <CheckCircleOutline sx={{fontSize: 40, color: "#1976d2"}}/>
                            }
                        ].map((item, index) => (
                            <Grid item xs={12} md={6} key={index} sx={{width: "100%"}}>
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
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="h6" sx={{fontWeight: 700, mb: 1.5, color: "#1e293b"}}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{color: "#64748b", lineHeight: 1.6}}>
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
            <Box sx={{py: {xs: 8, md: 12}, backgroundColor: "#1976d2", color: "white"}}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} sx={{textAlign: "center"}} justifyContent="center" alignItems="center">
                        {[
                            {number: "500+", label: "Trường học đã tham gia", sublabel: "Trên toàn quốc"},
                            {number: "50k+", label: "Đồng phục đã giao", sublabel: "Sản phẩm chất lượng cao"},
                            {number: "98%", label: "Tỷ lệ hài lòng", sublabel: "Sự chấp thuận của khách hàng"},
                            {number: "24/7", label: "Hỗ trợ có sẵn", sublabel: "Luôn sẵn sàng hỗ trợ"}
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
                                            fontSize: {xs: "2.2rem", md: "3.2rem"},
                                            lineHeight: 1
                                        }}
                                    >
                                        {stat.number}
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        mb: 0.5,
                                        fontSize: {xs: "1rem", md: "1.2rem"}
                                    }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        opacity: 0.85,
                                        fontSize: {xs: "0.85rem", md: "0.9rem"}
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
            <Box sx={{py: {xs: 8, md: 12}, backgroundColor: "#f8fafc", textAlign: "center"}}>
                <Container maxWidth="md">
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            color: "#1e293b",
                            fontSize: {xs: "2rem", md: "2.5rem"}
                        }}
                    >
                        Sẵn Sàng Thay Đổi Đồng Phục Trường Học?
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
                        Tham gia hàng trăm trường học trên toàn quốc tin tưởng UniSew cho nhu cầu đồng phục.
                        Bắt đầu ngay hôm nay và trải nghiệm sự khác biệt mà dịch vụ chuyên nghiệp mang lại.
                    </Typography>
                    <Box sx={{display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap"}}>
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
                            Bắt Đầu Dự Án
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
                            Liên Hệ Đội Ngũ
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
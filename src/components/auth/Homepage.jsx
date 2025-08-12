import {Avatar, Box, Button, Container, Grid, Paper, Stack, Typography, useMediaQuery, useTheme,} from "@mui/material";
import {ArrowForward, CheckCircle, DesignServices, EmojiEvents, Star,} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FactoryIcon from "@mui/icons-material/Factory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CountUp from "../ui/CountUp.jsx";

const stats = [
  {
    number: "500+",
    label: "Trường Học",
    icon: <SchoolIcon sx={{ fontSize: 32, color: "#6C63FF" }} />,
  },
  {
    number: "120+",
    label: "Nhà Thiết Kế",
    icon: <DesignServicesIcon sx={{ fontSize: 32, color: "#6C63FF" }} />,
  },
  {
    number: "80+",
    label: "Xưởng May",
    icon: <FactoryIcon sx={{ fontSize: 32, color: "#6C63FF" }} />,
  },
  {
    number: "5 Năm",
    label: "Năm Hoạt Động",
    icon: <CalendarTodayIcon sx={{ fontSize: 32, color: "#6C63FF" }} />,
  },
];

const features = [
  {
    icon: <DesignServices sx={{ fontSize: 40, color: "#6C63FF" }} />,
    title: "Studio Thiết Kế Tùy Chỉnh",
    description:
      "Tạo phong cách đồng phục độc đáo với công cụ thiết kế trực tuyến trực quan.",
  },
  {
    icon: <CheckCircle sx={{ fontSize: 40, color: "#6C63FF" }} />,
    title: "Đảm Bảo Chất Lượng",
    description:
      "Vật liệu cao cấp và kiểm soát chất lượng nghiêm ngặt cho mọi đơn hàng đồng phục.",
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40, color: "#6C63FF" }} />,
    title: "Giá Cả Tốt Nhất",
    description: "Giá cả cạnh tranh với chiết khấu số lượng lớn cho các trường học.",
  },
];

const testimonials = [
  {
    name: "Nguyễn Thị Lan",
    role: "Hiệu Trưởng, Trường Tiểu Học Thung Lũng Xanh",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    content:
      "UniSew đã thay đổi hoàn toàn quy trình đặt đồng phục của chúng tôi. Công cụ thiết kế rất trực quan và chất lượng xuất sắc.",
  },
  {
    name: "Trần Văn Minh",
    role: "Giáo Viên Chủ Nhiệm, Học Viện Bình Minh",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    content:
      "Dịch vụ và hỗ trợ tuyệt vời. Nền tảng trực tuyến giúp việc quản lý nhu cầu đồng phục trở nên dễ dàng.",
  },
  {
    name: "Lê Thị Hương",
    role: "Quản Lý, Trường Tiểu Học Tương Lai Tươi Sáng",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    content:
      "Chuyên nghiệp, đáng tin cậy và hiệu quả về chi phí. Rất khuyến nghị UniSew cho mọi nhu cầu đồng phục của trường học.",
  },
];

export default function Homepage() {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box sx={{ width: "100vw", overflow: "hidden" }}>
      {/* Hero Video Section */}
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          minHeight: { xs: "60vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          component="video"
          src="/unisew.mp4"
          autoPlay
          loop
          muted
          playsInline
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
        {/* Content */}
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, height: "100%" }}
        >
          <Box
            sx={{
              minHeight: { xs: "60vh", md: "80vh" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-start" },
              justifyContent: "center",
              textAlign: { xs: "left", md: "left" },
              pl: { xs: 1, sm: 3, md: 4, lg: 5 },
              gap: 4,
              pt: { xs: 4, md: 8 },
              pb: { xs: 6, md: 10 },
            }}
          >
            {/* Headline */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800, // Increased font weight for more impact
                color: "#fff",
                mb: 2, // Added margin-bottom to separate from subtitle
                fontSize: { xs: "2.5rem", md: "4.8rem", lg: "6rem" }, // Slightly larger font size
                lineHeight: 1.08,
                textShadow: "0 6px 30px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)", // Stronger shadow
                letterSpacing: 0,
              }}
            >
              Cách Mạng Hóa Đồng Phục Trường Học
            </Typography>
            {/* New Subtitle */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                mb: 4, // Margin before the button
                fontSize: { xs: "1rem", md: "1.5rem", lg: "1.8rem" },
                lineHeight: 1.5,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                maxWidth: 700,
              }}
            >
              Thiết kế, tùy chỉnh và đặt hàng đồng phục trường học chất lượng cao một cách dễ dàng.
            </Typography>
            {/* Join Now Button */}
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                background: "#1976d2",
                color: "white",
                fontWeight: 700,
                px: 6,
                py: 2,
                fontSize: "1.5rem",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(25,118,210,0.15)",
                textTransform: "none",
                "&:hover": {
                  background: "#1565c0",
                },
              }}
            >
              Tham Gia Ngay
            </Button>
          </Box>
        </Container>
      </Box>
      {/* About UniSew Block */}
      <Box
        sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 0 }, bgcolor: "white" }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              gap: { xs: 4, md: 8 },
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
              alt="Máy may"
              sx={{
                width: { xs: "100%", md: 400 },
                borderRadius: 3,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                objectFit: "cover",
                maxHeight: 360,
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 2, color: "#222" }}
              >
                Về UniSew
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#1976d2", mb: 2, fontWeight: 500 }}
              >
                UniSew là nền tảng thiết kế và đặt hàng đồng phục trường học hàng đầu.
              </Typography>
              <Typography variant="body1" sx={{ color: "#555", mb: 1 }}>
                Chúng tôi trao quyền cho các trường học tạo ra đồng phục độc đáo, chất lượng cao một cách dễ dàng. Từ thiết kế tùy chỉnh đến giao hàng nhanh chóng, UniSew là đối tác đáng tin cậy của bạn trong mọi bước của quy trình.
              </Typography>
              <Box
                component="ul"
                sx={{ pl: 3, mb: 3, color: "#444", fontSize: "1.1rem" }}
              >
                <li>Studio thiết kế trực tuyến trực quan và dễ sử dụng</li>
                <li>Vật liệu cao cấp, bền bỉ</li>
                <li>Giao hàng nhanh chóng, đáng tin cậy</li>
              </Box>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: "#1976d2",
                  color: "white",
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                  alignSelf: "flex-start",
                  "&:hover": { background: "#1565c0" },
                }}
              >
                Khám Phá UniSew
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          background: "white",
          py: 6,
          transform: "translateY(-50px)",
          position: "relative",
          zIndex: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flexWrap: { xs: "wrap", md: "nowrap" },
              justifyContent: "center",
              alignItems: "stretch",
              gap: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  minWidth: { xs: 220, md: 240 },
                  minHeight: { xs: 180, md: 200 },
                  width: { xs: "100%", md: "100%" },
                  maxWidth: 260,
                  flex: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  border: "1px solid rgba(108,99,255,0.1)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(108,99,255,0.08)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 15px 35px rgba(108,99,255,0.15)",
                  },
                }}
              >
                <Box sx={{ color: "#6C63FF", mb: 2 }}>{stat.icon}</Box>
                {/*<Typography variant="h3" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1 }}>*/}
                {/*  {stat.number}*/}
                {/*</Typography>*/}
                <CountUp
                  from={0}
                  to={stat.number}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ background: "#f8fafc", py: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Tại Sao Chọn UniSew?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Chúng tôi cung cấp giải pháp đồng phục toàn diện giúp toàn bộ quy trình trở nên mượt mà và hiệu quả
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={3} sm={3} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: 350,
                    width: "100%",
                    mx: "auto",
                    p: 4,
                    borderRadius: 3,
                    background: "white",
                    border: "1px solid rgba(108,99,255,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 15px 35px rgba(108,99,255,0.1)",
                      borderColor: "#6C63FF",
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#64748b", lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ background: "white", py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#1e293b",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Cách Thức Hoạt Động
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Các bước đơn giản để thiết kế và giao đồng phục trường học chất lượng cao
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                step: "01",
                title: "Thiết Kế Đồng Phục",
                description:
                  "Sử dụng studio thiết kế trực quan để tạo phong cách đồng phục độc đáo và phù hợp với bản sắc trường học",
              },
              {
                step: "02",
                title: "Đặt Hàng",
                description:
                  "Xem lại thiết kế và đặt hàng với các tùy chọn thanh toán an toàn và linh hoạt",
              },
              {
                step: "03",
                title: "Nhận Giao Hàng",
                description:
                  "Nhận đồng phục chất lượng cao được giao trực tiếp đến trường học với dịch vụ hậu mãi tận tâm",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={4} md={4} key={index}>
                <Box sx={{ textAlign: "center", position: "relative", maxWidth: 300, width: "100%", mx: "auto" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6C63FF 0%, #A084E8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#64748b", lineHeight: 1.7 }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "white",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Khách Hàng Nói Gì
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Đừng chỉ tin lời chúng tôi - hãy nghe từ các trường học mà chúng tôi đã hỗ trợ thành công
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={4} sm={4} md={4} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "white",
                    height: "100%",
                    maxWidth: 300,
                    width: "100%",
                    mx: "auto",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} sx={{ color: "#FFD700", fontSize: 20 }} />
                    ))}
                  </Stack>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      color: "#374151",
                      lineHeight: 1.7,
                      fontStyle: "italic",
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{
                        width: 50,
                        height: 50,
                        border: "3px solid #6C63FF",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: "#1e293b" }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ background: "white", py: 10 }}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              background: "linear-gradient(135deg, #6C63FF 0%, #A084E8 100%)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  mb: 3,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                }}
              >
                Sẵn Sàng Thay Đổi Trải Nghiệm Đồng Phục Của Trường Học?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  mb: 4,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                              Tham gia hàng trăm trường học trên toàn quốc đã tin tưởng UniSew cho nhu cầu đồng phục của họ
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  background: "white",
                  color: "#6C63FF",
                  fontWeight: 700,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Bắt Đầu Ngay Hôm Nay
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
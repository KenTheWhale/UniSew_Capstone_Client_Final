import React from 'react';

export default function HowItWork() {
    const steps = [
        {
            number: '01',
            title: 'Tạo Yêu Cầu Thiết Kế',
            description: 'Bắt đầu dự án bằng cách gửi yêu cầu thiết kế chi tiết, mô tả tầm nhìn và yêu cầu của bạn.',
            icon: '✏️'
        },
        {
            number: '02',
            title: 'Chờ Đợi Đề Xuất Từ Nhà Thiết Kế',
            description: 'Khi yêu cầu của bạn được đăng, các nhà thiết kế sẽ xem xét và gửi đề xuất để làm việc trên dự án của bạn.',
            icon: '⏳'
        },
        {
            number: '03',
            title: 'Chọn Nhà Thiết Kế Và Báo Giá',
            description: 'Xem xét các đề xuất, chọn nhà thiết kế phù hợp nhất với nhu cầu và lựa chọn báo giá thiết kế ưa thích.',
            icon: '👨‍🎨'
        },
        {
            number: '04',
            title: 'Thanh Toán Và Trò Chuyện Với Nhà Thiết Kế',
            description: 'Hoàn thành thanh toán cho báo giá thiết kế đã chọn để mở khóa giao tiếp trực tiếp với nhà thiết kế đã chọn.',
            icon: '💬'
        },
        {
            number: '05',
            title: 'Yêu Cầu Chỉnh Sửa Hoặc Hoàn Thành',
            description: 'Cộng tác với nhà thiết kế, đưa ra phản hồi, yêu cầu chỉnh sửa và hoàn thiện thiết kế cho đến khi bạn hài lòng.',
            icon: '✅'
        },
        {
            number: '06',
            title: 'Tạo Đơn Hàng',
            description: 'Khi thiết kế đã hoàn thành, tiến hành tạo đơn hàng sản xuất sử dụng thiết kế đã được phê duyệt.',
            icon: '📋'
        },
        {
            number: '07',
            title: 'Chờ Đợi Báo Giá Từ Nhà Máy',
            description: 'Đơn hàng của bạn sẽ được gửi đến các nhà máy may mặc khác nhau để họ đưa ra báo giá sản xuất.',
            icon: '🏭'
        },
        {
            number: '08',
            title: 'Chọn Nhà Máy Và Thanh Toán',
            description: 'Xem xét báo giá từ nhà máy, chọn lựa chọn tốt nhất và hoàn thành thanh toán để bắt đầu sản xuất.',
            icon: '💰'
        },
        {
            number: '09',
            title: 'Theo Dõi Và Hoàn Thành Đơn Hàng',
            description: 'Theo dõi tiến độ đơn hàng thông qua hệ thống của chúng tôi, từ sản xuất đến vận chuyển. Khi nhận được và hài lòng, xác nhận hoàn thành để kết thúc dự án.',
            icon: '📦🎉'
        }
    ];

    return (
        <div style={{
            padding: '60px 40px',
            width: '80vw',
            maxWidth: '1200px',
            margin: '40px auto',
            fontFamily: '"Poppins", Arial, sans-serif',
            color: '#333',
            backgroundColor: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderRadius: '12px',
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '50px'
            }}>
                <h1 style={{
                    fontSize: '2.8rem',
                    color: '#2c3e50',
                    marginBottom: '15px',
                    fontWeight: '700'
                }}>Quy Trình Hoạt Động</h1>
                <div style={{
                    width: '80px',
                    height: '4px',
                    backgroundColor: '#3498db',
                    margin: '0 auto 25px'
                }}></div>
                <p style={{
                    fontSize: '1.2rem',
                    color: '#7f8c8d',
                    maxWidth: '700px',
                    margin: '0 auto'
                }}>Làm theo những bước đơn giản này để biến thiết kế thời trang của bạn từ ý tưởng thành hiện thực</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                marginTop: '40px'
            }}>
                {steps.map((step, index) => (
                    <div key={index} style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '30px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                        border: '1px solid #eaeaea',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '3rem',
                            opacity: '0.2',
                            color: '#3498db'
                        }}>{step.icon}</div>
                        <div style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>{step.number}</div>
                        <h3 style={{
                            fontSize: '1.3rem',
                            marginBottom: '15px',
                            color: '#2c3e50',
                            fontWeight: '600',
                            position: 'relative',
                            zIndex: '1'
                        }}>{step.title}</h3>
                        <p style={{
                            color: '#7f8c8d',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            position: 'relative',
                            zIndex: '1'
                        }}>{step.description}</p>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '60px',
                textAlign: 'center',
                padding: '30px',
                backgroundColor: '#f1f8fe',
                borderRadius: '10px'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Sẵn Sàng Bắt Đầu Dự Án?</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Tạo yêu cầu thiết kế đầu tiên và biến tầm nhìn của bạn thành hiện thực</p>
                <button style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    Bắt Đầu Ngay
                </button>
            </div>
        </div>
    );
}
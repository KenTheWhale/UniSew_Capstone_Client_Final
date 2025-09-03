import React from 'react';
import {getAccessCookie} from "../../utils/CookieUtil.jsx";

export default function HowItWork() {
    const steps = [
        {
            number: '01',
            title: 'Create a Design Request',
            description: 'Initiate your project by submitting a detailed design request, outlining your vision and requirements.',
            icon: '✏️'
        },
        {
            number: '02',
            title: 'Await Designer Bids',
            description: 'Once your request is live, designers will review it and submit their quotations to work on your project.',
            icon: '⏳'
        },
        {
            number: '03',
            title: 'Select a Designer and Quotation',
            description: 'Review the quotations, choose the designer that best fits your needs, and select their preferred design quotation.',
            icon: '👨‍🎨'
        },
        {
            number: '04',
            title: 'Payment and Designer Chat',
            description: 'Complete the payment for the chosen design quotation to unlock direct communication with your selected designer.',
            icon: '💬'
        },
        {
            number: '05',
            title: 'Request Revisions or Finalize',
            description: 'Collaborate with your designer, provide feedback, request revisions, and finalize the design until you are satisfied.',
            icon: '✅'
        },
        {
            number: '06',
            title: 'Create an Order',
            description: 'Once the design is finalized, proceed to create a production order using the approved design.',
            icon: '📋'
        },
        {
            number: '07',
            title: 'Await Factory Quotations',
            description: 'Your order will be sent to various garment factories who will then provide their quotations for production.',
            icon: '🏭'
        },
        {
            number: '08',
            title: 'Select Garment Factory and Make a Payment',
            description: 'Review the garment factory quotes, select the best option, and complete the payment to initiate production.',
            icon: '💰'
        },
        {
            number: '09',
            title: 'Track and Complete Your Order',
            description: 'Monitor the progress of your order through our system, from production to shipping. Once received and satisfied, confirm completion to close the project.',
            icon: '📦🎉'
        }
    ];
     function handleJoinNow() {
        const access = getAccessCookie();
        if (access == null) {
            console.log("access cookie =", getAccessCookie());
            window.location.href = '/login';
            return;
        }
        console.log("access cookiein =", getAccessCookie());
        const role = access.role
        switch (role) {
            case 'admin':
                window.location.href = '/admin/dashboard';
                break;
            case 'school':
                window.location.href = '/school/design';
                break;
            case 'designer':
                window.location.href = '/designer/requests';
                break;
            case 'garment':
                window.location.href = '/garment/orders';
                break;
            default:
                window.location.href = '/login';
                break;
        }

    }

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
                }}>How It Works</h1>
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
                }}>Follow these simple steps to bring your fashion design from concept to reality</p>
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
                <h3 style={{color: '#2c3e50', marginBottom: '15px'}}>Ready to Start Your Project?</h3>
                <p style={{color: '#7f8c8d', marginBottom: '25px'}}>Create your first design request and bring your
                    vision to life</p>
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
                }}
                onClick={handleJoinNow}>
                    Start Now
                </button>
            </div>
        </div>
    );
}

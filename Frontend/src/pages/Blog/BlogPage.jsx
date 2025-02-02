import { assests } from '../../assests/assests';
import './BlogPage.css';
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const BlogPage = () => {
  // Image arrays for different product sections
  const gheeImages = [assests.Blogghee1, assests.Blogghee2, assests.Blogghee3];
  const milkImages = [
    assests.Blogmilk1,
    assests.Blogmilk2,
    assests.Blogmilk3,
    assests.Blogmilk4,
  ];
  const cowImages = [
    assests.Blogcow1,
    assests.Blogcow2,
    assests.Blogcow3,
    assests.Blogcow4,
    assests.Blogcow5,
    assests.Blogcow6,
  ];
  

  // Testimonials array for the testimonial section
  const testimonials = [
    {
      quote:
        'The ghee from this dairy farm is pure and full of flavor. It has brought back memories of homemade ghee from my childhood. Absolutely love it!',
      name: 'Priya Sharma',
      role: 'Homemaker',
    },
    {
      quote:
        'The milk quality is top-notch, and the eco-friendly packaging is a great touch. I always feel like I\'m making a healthier choice.',
      name: 'Arjun Singh',
      role: 'Fitness Enthusiast',
    },
    {
      quote:
        'Visiting the farm was an amazing experience! The cows are so well cared for, and you can taste the quality in their products.',
      name: 'Nisha Patel',
      role: 'Food Blogger',
    },
  ];

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Slideshow Component
  const Slideshow = ({ images }) => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImage((prevImage) => (prevImage + 1) % images.length);
      }, 1500); // Change image every 1.5 seconds

      return () => clearInterval(interval);
    }, [images]);

    return (
      <div className="slideshow-container">
        <div className="slideshow">
          <img src={images[currentImage]} alt="Slideshow" className="slideshow-image" />
        </div>
      </div>
    );
  };

  return (
    <div className="blog">
      {/* Ghee Section */}
      <section className="blog-section" data-aos="fade-up">
        <div className="section-images">
          <Slideshow images={gheeImages} />
        </div>
        <div className="section-content">
          <h2>Ghee</h2>
          <p>
            Our ghee is crafted using the traditional bilona method, which
            preserves its authenticity and quality. Rich in Omega-3 fatty
            acids and antioxidants, it's a nutritious choice for a healthy
            lifestyle. Available in convenient 200g, 500g, and 1kg jars, our
            packaging ensures freshness and purity.
          </p>
        </div>
      </section>

      {/* Milk Section */}
      <section className="blog-section" data-aos="fade-up">
        <div className="section-content">
          <h2>Milk</h2>
          <p>
            Our milk is sourced from healthy cows and processed to retain its
            nutritional value. Rich in calcium and essential vitamins, it's
            perfect for your daily diet. Available in pasteurized and
            unpasteurized options, with eco-friendly packaging.
          </p>
        </div>
        <div className="section-images">
          <Slideshow images={milkImages} />
        </div>
      </section>

            {/* Cow Section */}
            <section className="cow-section">
  <h2 className="section-title">Cows in Our Farm</h2>
  <div className="cow-images-container">
    {cowImages.map((image, index) => (
      <div
        key={index}
        className="cow-image-wrapper"
        data-aos="fade-up"
        data-aos-delay={index * 100}
      >
<img src={image} alt={`Cow ${index + 1}`} loading="lazy" className="cow-image" />
</div>
    ))}
  </div>
</section>


      {/* Testimonial Section */}
   <section className="testimonial-section" data-aos="fade-up">
  <div className="testimonial-header">
    {/* Left Title */}
    <h2 className="testimonial-title">What Our Customers Say</h2>
    {/* Right Title */}
    <h2 className="video-title">Explore Our Dairy Farm</h2>
  </div>
  <div className="testimonial-container">
    {/* Testimonials Section */}
    <div className="testimonial-partition">
            <div className="testimonial-carousel">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card"
                  data-aos="zoom-in"
                  data-aos-delay={index * 150}
                >
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <h3 className="testimonial-name">- {testimonial.name}</h3>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Section */}
          <div className="video-partition" data-aos="fade-up" data-aos-delay="500">
            <div className="video-container">
              <video controls className="video-element">
                <source src="path-to-your-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="video-description">
              Discover how we ensure the best quality dairy products, from our farm to your table.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};



export default BlogPage;  
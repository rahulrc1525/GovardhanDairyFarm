import React, { useRef } from 'react';
import Slider from 'react-slick';
import './Header.css';
import { assests } from '../../assests/assests'; // Import your assets

// Image assets for the header
const images = [
  { id: 1, src: assests.gheebanner, alt: 'Milk Banner' },
  { id: 2, src: assests.bannermilk, alt: 'Vishakha Milk Banner' },
  { id: 3, src: assests.BANNERTRY, alt: 'Try Milk Banner' },
  { id: 4, src: assests.CURD, alt: 'Ghee Banner' },
];

const Header = () => {
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500, // Slide transition speed (0.5 seconds)
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000, // Change duration between slides (4 seconds)
    fade: true, // Enable fade transition
    cssEase: 'linear',
  };

  const handleHeaderClick = (event) => {
    const containerWidth = event.currentTarget.offsetWidth;
    const clickPosition = event.clientX;

    if (clickPosition < containerWidth / 2) {
      // Click on the left half, go to the previous slide
      sliderRef.current.slickPrev();
    } else {
      // Click on the right half, go to the next slide
      sliderRef.current.slickNext();
    }
  };

  return (
    <div className="header-container" onClick={handleHeaderClick}>
      <Slider {...settings} ref={sliderRef}>
        {images.map((image) => (
          <div key={image.id} className="header-image-container">
            <img src={image.src} alt={image.alt} className="header-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Header;

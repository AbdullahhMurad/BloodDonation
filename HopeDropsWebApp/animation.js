$(document).ready(function() {
    // Number of circles you want to generate
    const numberOfCircles = 50;
  
    for (let i = 0; i < numberOfCircles; i++) {
      createCircle();
    }
  
    function createCircle() {
      const circleSize = Math.floor(Math.random() * 30) + 10; // Random size between 10 and 40 pixels
      const circle = $('<div class="circle"></div>');
  
      circle.css({
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        left: `${Math.random() * 100}vw`,
      });
  
      $('.circles-container').append(circle);
    }
  });
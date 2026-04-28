// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize Locomotive Scroll
const locoScroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1.2, // Adjust scrolling speed
    getDirection: true,
    mobile: {
        smooth: true
    },
    tablet: {
        smooth: true
    }
});

// Handle Navigation Links for Locomotive Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            locoScroll.scrollTo(targetId, {
                offset: 0,
                duration: 1000,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        }
    });
});

// Update ScrollTrigger each time Locomotive Scroll updates
locoScroll.on("scroll", ScrollTrigger.update);

// Tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
    pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});

// Each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.refresh();

/* =========================================================================
   Custom Cursor Logic
   ========================================================================= */
const cursor = document.getElementById('cursor');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Render cursor smoothly using requestAnimationFrame
function animateCursor() {
    // Easing factor for lag effect
    let dx = mouseX - cursorX;
    let dy = mouseY - cursorY;
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    
    // Scale up if hovered class is present
    if (cursor.classList.contains('hovered')) {
        cursor.style.transform += ` scale(2.5)`;
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Add hover effects to interactable elements
const interactables = document.querySelectorAll('a, button, .cursor-pointer, .magnetic-text');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
    });
});

/* =========================================================================
   Magnetic Effect for Hero Text
   ========================================================================= */
const magneticElements = document.querySelectorAll('.magnetic-text');

magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const position = el.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        // Move element slightly towards mouse
        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    el.addEventListener('mouseleave', () => {
        // Reset position when mouse leaves
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
});

/* =========================================================================
   GSAP Animations
   ========================================================================= */

// Hero animations on load
const heroTimeline = gsap.timeline();

heroTimeline.fromTo(".hero-title span", 
    { y: 100, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.2 }
)
.fromTo(".hero-subtitle", 
    { y: 50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
    "-=0.5"
)
.fromTo("#navbar", 
    { y: -50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
    "-=0.8"
);

// Image Reveal Animations on scroll
const imageReveals = document.querySelectorAll('.reveal-overlay');

imageReveals.forEach(overlay => {
    gsap.to(overlay, {
        scrollTrigger: {
            trigger: overlay.parentElement,
            scroller: "[data-scroll-container]",
            start: "top 80%", // trigger when top of element hits 80% of viewport
        },
        scaleY: 0, // scale down to 0 on the Y axis
        transformOrigin: "top", // start from top
        duration: 1.5,
        ease: "power4.inOut"
    });
});

// Hide/Show navbar on scroll direction using Locomotive Scroll event
let lastScrollY = 0;
const navbar = document.getElementById('navbar');

locoScroll.on('scroll', (args) => {
    const currentScrollY = args.scroll.y;
    
    if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
            // Scrolling down - hide navbar
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show navbar
            navbar.style.transform = 'translateY(0)';
        }
    } else {
        // Top of page - show navbar
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
});

/* =========================================================================
   Skill Card Hover Animations
   ========================================================================= */
const skillCards = document.querySelectorAll('.skill-card');

skillCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
});

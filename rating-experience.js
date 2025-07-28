// Rating Experience JavaScript
class RatingExperience {
    constructor() {
        this.ratings = {
            overall: 0,
            shooting: 0,
            phishing: 0,
            questions: 0,
            design: 0
        };
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.initializeEmailJS();
        this.loadSavedName();
    }

    initializeEmailJS() {
        // Initialize EmailJS with your service ID
        // Replace "YOUR_USER_ID" with your EmailJS Public Key from Account settings
        emailjs.init("SdFRWS3QAssMvruBN"); // Replace with your EmailJS user ID
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }

    loadSavedName() {
        // Load saved name from localStorage
        const savedName = localStorage.getItem('cyberdefender_username');
        if (savedName) {
            const nameInput = document.getElementById('userName');
            if (nameInput) {
                nameInput.value = savedName;
                // Make the field read-only since it's pre-filled
                nameInput.readOnly = true;
                nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                nameInput.style.color = 'rgba(255, 255, 255, 0.7)';
                nameInput.style.cursor = 'not-allowed';
                console.log('Rating page loaded saved name:', savedName);
                
                // Trigger validation to recognize the pre-filled name as valid
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Also trigger validation after a short delay to ensure DOM is ready
                setTimeout(() => {
                    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Clear any validation errors on the name field
                    nameInput.setCustomValidity('');
                    nameInput.reportValidity();
                }, 100);
            }
        }
    }

    setupEventListeners() {
        // Star rating listeners
        this.setupStarRatings();
        
        // Form submission
        const form = document.getElementById('ratingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Success modal
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Radio and checkbox listeners
        this.setupFormListeners();
    }

    setupStarRatings() {
        const starContainers = document.querySelectorAll('.star-rating');
        
        starContainers.forEach(container => {
            const stars = container.querySelectorAll('.stars i');
            const ratingText = container.querySelector('.rating-text');
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const rating = index + 1;
                    const category = star.dataset.category || 'overall';
                    
                    this.setStarRating(stars, rating, category);
                    this.updateRatingText(ratingText, rating);
                });

                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, index + 1);
                });
            });

            // Mouse leave event for container
            container.addEventListener('mouseleave', () => {
                const currentRating = this.ratings[stars[0].dataset.category || 'overall'];
                this.highlightStars(stars, currentRating);
            });
        });
    }

    setStarRating(stars, rating, category) {
        this.ratings[category] = rating;
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffd700';
                star.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            } else {
                star.style.color = 'rgba(255, 255, 255, 0.3)';
                star.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.1)';
            }
        });
    }

    updateRatingText(ratingText, rating) {
        if (!ratingText) return;
        
        const texts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        
        ratingText.textContent = texts[rating] || 'Click to rate';
    }

    setupFormListeners() {
        // Name input
        const nameInput = document.getElementById('userName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.formData[e.target.name] = e.target.value;
            });
        }

        // Radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.formData[e.target.name] = e.target.value;
            });
        });

        // Checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (!this.formData[e.target.name]) {
                    this.formData[e.target.name] = [];
                }
                
                if (e.target.checked) {
                    this.formData[e.target.name].push(e.target.value);
                } else {
                    const index = this.formData[e.target.name].indexOf(e.target.value);
                    if (index > -1) {
                        this.formData[e.target.name].splice(index, 1);
                    }
                }
            });
        });

        // Textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                this.formData[e.target.name] = e.target.value;
            });
        });
    }

    validateForm() {
        const errors = [];

        // Required: Name
        if (!this.formData.userName || this.formData.userName.trim() === '') {
            errors.push('• Please enter your name');
        }

        // Required: Overall rating
        if (this.ratings.overall === 0) {
            errors.push('• Please provide an overall rating');
        }

        // Required: Shooting game rating
        if (this.ratings.shooting === 0) {
            errors.push('• Please rate the shooting game');
        }

        // Required: Phishing simulation rating
        if (this.ratings.phishing === 0) {
            errors.push('• Please rate the phishing simulation');
        }

        // Required: Questions rating
        if (this.ratings.questions === 0) {
            errors.push('• Please rate the cybersecurity questions');
        }

        // Required: Design rating
        if (this.ratings.design === 0) {
            errors.push('• Please rate the visual design');
        }

        // Required: Learning level
        if (!this.formData.learning) {
            errors.push('• Please select how much you learned');
        }

        // Required: Navigation rating
        if (!this.formData.navigation) {
            errors.push('• Please rate the website navigation');
        }

        // Required: Recommendation
        if (!this.formData.recommend) {
            errors.push('• Please indicate if you would recommend this');
        }

        // Optional: Helpful topics (at least one should be selected)
        if (!this.formData.helpful_topics || this.formData.helpful_topics.length === 0) {
            errors.push('• Please select at least one helpful topic');
        }

        return errors;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        const errors = this.validateForm();
        if (errors.length > 0) {
            const errorMessage = 'Please complete the following required fields:\n\n' + errors.join('\n');
            alert(errorMessage);
            return;
        }

        // Prepare data for submission
        const submissionData = {
            timestamp: new Date().toISOString(),
            userName: this.formData.userName,
            ratings: this.ratings,
            formData: this.formData,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language
        };

        try {
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending Feedback...</span>';
            submitBtn.disabled = true;

            // Send feedback via EmailJS
            await this.sendFeedbackEmail(submissionData);

            // Show success modal
            this.showSuccessModal();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('There was an error sending your feedback. Please try again.');
            
            // Reset button
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async sendFeedbackEmail(data) {
        // Format the email content
        const emailContent = this.formatEmailContent(data);
        
        // EmailJS template parameters
        const templateParams = {
            to_email: 'obimary938@gmail.com',
            from_name: data.userName,
            subject: 'CyberDefender Feedback - New Rating Submission',
            message: emailContent
        };

        try {
            // Send email using EmailJS
            // Replace 'YOUR_SERVICE_ID' with your EmailJS Service ID (from Email Services)
            // Replace 'YOUR_TEMPLATE_ID' with your EmailJS Template ID (from Email Templates)
            const response = await emailjs.send(
                'service_78fit5b', // Replace with your EmailJS service ID (e.g., "service_abc123")
                'template_hbbj66j', // Replace with your EmailJS template ID (e.g., "template_xyz789")
                templateParams
            );

            console.log('Email sent successfully:', response);
            
            // Also store in localStorage as backup
            const existingFeedback = JSON.parse(localStorage.getItem('cyberdefender_feedback') || '[]');
            existingFeedback.push(data);
            localStorage.setItem('cyberdefender_feedback', JSON.stringify(existingFeedback));
            
        } catch (error) {
            console.error('EmailJS error:', error);
            throw new Error('Failed to send email');
        }
    }

    formatEmailContent(data) {
        const formatRating = (rating) => {
            const descriptions = {
                1: 'Poor',
                2: 'Fair', 
                3: 'Good',
                4: 'Very Good',
                5: 'Excellent'
            };
            return `${rating}/5 - ${descriptions[rating]}`;
        };

        const formatLearning = (learning) => {
            const descriptions = {
                'nothing': 'Nothing new',
                'little': 'A little bit',
                'moderate': 'Moderate amount',
                'lot': 'A lot',
                'excellent': 'Excellent learning'
            };
            return descriptions[learning] || learning;
        };

        const formatNavigation = (navigation) => {
            const descriptions = {
                'very_difficult': 'Very difficult',
                'difficult': 'Difficult',
                'neutral': 'Neutral',
                'easy': 'Easy',
                'very_easy': 'Very easy'
            };
            return descriptions[navigation] || navigation;
        };

        const formatRecommend = (recommend) => {
            const descriptions = {
                'definitely_not': 'Definitely not',
                'probably_not': 'Probably not',
                'maybe': 'Maybe',
                'probably': 'Probably',
                'definitely': 'Definitely'
            };
            return descriptions[recommend] || recommend;
        };

        const emailContent = `
CYBERDEFENDER FEEDBACK REPORT
============================

Submitted by: ${data.userName}
Submission Date: ${new Date(data.timestamp).toLocaleString()}

RATINGS
-------
Overall Experience: ${formatRating(data.ratings.overall)}
Shooting Game: ${formatRating(data.ratings.shooting)}
Phishing Simulation: ${formatRating(data.ratings.phishing)}
Cybersecurity Questions: ${formatRating(data.ratings.questions)}
Visual Design: ${formatRating(data.ratings.design)}

LEARNING EXPERIENCE
------------------
How much did they learn: ${formatLearning(data.formData.learning)}
Helpful topics: ${data.formData.helpful_topics ? data.formData.helpful_topics.join(', ') : 'None selected'}

USER EXPERIENCE
--------------
Navigation ease: ${formatNavigation(data.formData.navigation)}
Would recommend: ${formatRecommend(data.formData.recommend)}

OPTIONAL FEEDBACK
----------------
Improvements suggested: ${data.formData.improvements || 'No suggestions provided'}
Problems encountered: ${data.formData.problems || 'No problems reported'}
Additional comments: ${data.formData.additional || 'No additional comments'}

TECHNICAL INFO
--------------
User Agent: ${data.userAgent}
Screen Resolution: ${data.screenResolution}
Language: ${data.language}

---
This feedback was submitted through the CyberDefender rating system.
        `.trim();

        return emailContent;
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Add animation
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                modal.style.transition = 'all 0.3s ease';
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            }, 10);
        }
    }

    // Utility method to get rating descriptions
    getRatingDescription(rating) {
        const descriptions = {
            1: 'Poor - Needs significant improvement',
            2: 'Fair - Has potential but needs work',
            3: 'Good - Meets basic expectations',
            4: 'Very Good - Exceeds expectations',
            5: 'Excellent - Outstanding experience'
        };
        return descriptions[rating] || 'Not rated';
    }

    // Method to generate feedback summary (for admin purposes)
    generateFeedbackSummary() {
        const feedback = JSON.parse(localStorage.getItem('cyberdefender_feedback') || '[]');
        
        if (feedback.length === 0) {
            return 'No feedback submitted yet.';
        }

        const summary = {
            totalSubmissions: feedback.length,
            averageOverallRating: 0,
            averageShootingRating: 0,
            averagePhishingRating: 0,
            averageQuestionsRating: 0,
            averageDesignRating: 0,
            learningDistribution: {},
            navigationDistribution: {},
            recommendationDistribution: {},
            commonImprovements: [],
            commonProblems: []
        };

        let totalOverall = 0, totalShooting = 0, totalPhishing = 0, totalQuestions = 0, totalDesign = 0;

        feedback.forEach(submission => {
            // Calculate averages
            totalOverall += submission.ratings.overall;
            totalShooting += submission.ratings.shooting;
            totalPhishing += submission.ratings.phishing;
            totalQuestions += submission.ratings.questions;
            totalDesign += submission.ratings.design;

            // Count distributions
            if (submission.formData.learning) {
                summary.learningDistribution[submission.formData.learning] = 
                    (summary.learningDistribution[submission.formData.learning] || 0) + 1;
            }

            if (submission.formData.navigation) {
                summary.navigationDistribution[submission.formData.navigation] = 
                    (summary.navigationDistribution[submission.formData.navigation] || 0) + 1;
            }

            if (submission.formData.recommend) {
                summary.recommendationDistribution[submission.formData.recommend] = 
                    (summary.recommendationDistribution[submission.formData.recommend] || 0) + 1;
            }

            // Collect text feedback
            if (submission.formData.improvements) {
                summary.commonImprovements.push(submission.formData.improvements);
            }

            if (submission.formData.problems) {
                summary.commonProblems.push(submission.formData.problems);
            }
        });

        summary.averageOverallRating = (totalOverall / feedback.length).toFixed(1);
        summary.averageShootingRating = (totalShooting / feedback.length).toFixed(1);
        summary.averagePhishingRating = (totalPhishing / feedback.length).toFixed(1);
        summary.averageQuestionsRating = (totalQuestions / feedback.length).toFixed(1);
        summary.averageDesignRating = (totalDesign / feedback.length).toFixed(1);

        return summary;
    }
}

// Initialize the rating experience when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RatingExperience();
});

// Export for potential use in other scripts
window.RatingExperience = RatingExperience; 
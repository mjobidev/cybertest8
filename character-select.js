// Character Selection JavaScript
class CharacterSelector {
    constructor() {
        this.selectedAvatar = null;
        this.avatars = [
            {
                id: 'cyber-agent-1',
                name: 'Cyber Agent Alpha',
                icon: 'fas fa-user-shield',
                color: '#00ffff',
                description: 'Elite cyber defender'
            },
            {
                id: 'cyber-agent-2',
                name: 'Digital Guardian',
                icon: 'fas fa-user-ninja',
                color: '#ff00ff',
                description: 'Stealth security specialist'
            },
            {
                id: 'cyber-agent-3',
                name: 'Neon Warrior',
                icon: 'fas fa-user-astronaut',
                color: '#ffff00',
                description: 'Futuristic combat expert'
            },
            {
                id: 'cyber-agent-4',
                name: 'Tech Sentinel',
                icon: 'fas fa-user-graduate',
                color: '#00ff00',
                description: 'Advanced AI specialist'
            },
            {
                id: 'cyber-agent-5',
                name: 'Cyber Commander',
                icon: 'fas fa-user-tie',
                color: '#ff8000',
                description: 'Strategic defense leader'
            },
            {
                id: 'cyber-agent-6',
                name: 'Digital Phantom',
                icon: 'fas fa-user-secret',
                color: '#8000ff',
                description: 'Covert operations expert'
            },
            {
                id: 'cyber-agent-7',
                name: 'Neon Striker',
                icon: 'fas fa-user-cog',
                color: '#ff0080',
                description: 'Tactical response unit'
            },
            {
                id: 'cyber-agent-8',
                name: 'Cyber Scout',
                icon: 'fas fa-user-clock',
                color: '#00ff80',
                description: 'Reconnaissance specialist'
            }
        ];
        this.init();
    }

    init() {
        this.hideLoadingScreen();
        this.loadCurrentAvatar();
        this.renderAvatars();
        this.setupEventListeners();
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

    loadCurrentAvatar() {
        const savedAvatar = localStorage.getItem('cyberdefender_avatar');
        if (savedAvatar) {
            this.selectedAvatar = JSON.parse(savedAvatar);
            this.updateCurrentAvatarDisplay();
        }
    }

    renderAvatars() {
        const container = document.getElementById('avatarsContainer');
        if (!container) return;

        container.innerHTML = '';

        this.avatars.forEach(avatar => {
            const avatarElement = this.createAvatarElement(avatar);
            container.appendChild(avatarElement);
        });
    }

    createAvatarElement(avatar) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar-option';
        avatarDiv.dataset.avatarId = avatar.id;
        
        if (this.selectedAvatar && this.selectedAvatar.id === avatar.id) {
            avatarDiv.classList.add('selected');
        }

        avatarDiv.innerHTML = `
            <i class="${avatar.icon}" style="color: ${avatar.color};"></i>
        `;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'avatar-name';
        nameDiv.textContent = avatar.name;

        const wrapper = document.createElement('div');
        wrapper.appendChild(avatarDiv);
        wrapper.appendChild(nameDiv);

        avatarDiv.addEventListener('click', () => {
            this.selectAvatar(avatar);
        });

        return wrapper;
    }

    selectAvatar(avatar) {
        // Remove previous selection
        const previousSelected = document.querySelector('.avatar-option.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add selection to clicked avatar
        const avatarElement = document.querySelector(`[data-avatar-id="${avatar.id}"]`);
        if (avatarElement) {
            avatarElement.classList.add('selected');
        }

        this.selectedAvatar = avatar;
        this.updateCurrentAvatarDisplay();
        this.updateSaveButton();
    }

    updateCurrentAvatarDisplay() {
        const currentAvatarDiv = document.getElementById('currentAvatar');
        if (!currentAvatarDiv) return;

        if (this.selectedAvatar) {
            currentAvatarDiv.innerHTML = `
                <i class="${this.selectedAvatar.icon}" style="color: ${this.selectedAvatar.color}; font-size: 3rem;"></i>
            `;
            currentAvatarDiv.classList.add('selected');
        } else {
            currentAvatarDiv.innerHTML = `
                <div class="avatar-placeholder">
                    <i class="fas fa-user-circle"></i>
                    <span>No avatar selected</span>
                </div>
            `;
            currentAvatarDiv.classList.remove('selected');
        }
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveAvatarBtn');
        if (saveBtn) {
            saveBtn.disabled = !this.selectedAvatar;
        }
    }

    setupEventListeners() {
        // Save avatar button
        const saveBtn = document.getElementById('saveAvatarBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveAvatar();
            });
        }

        // Reset avatar button
        const resetBtn = document.getElementById('resetAvatarBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAvatar();
            });
        }

        // Success modal back button
        const backBtn = document.getElementById('backToHomeBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    saveAvatar() {
        if (!this.selectedAvatar) return;

        // Save to localStorage
        localStorage.setItem('cyberdefender_avatar', JSON.stringify(this.selectedAvatar));

        // Show success modal
        this.showSuccessModal();

        // Update header avatar on all pages
        this.updateHeaderAvatar();
    }

    resetAvatar() {
        // Remove saved avatar
        localStorage.removeItem('cyberdefender_avatar');
        
        // Clear selection
        this.selectedAvatar = null;
        
        // Update UI
        const selectedElements = document.querySelectorAll('.avatar-option.selected');
        selectedElements.forEach(el => el.classList.remove('selected'));
        
        this.updateCurrentAvatarDisplay();
        this.updateSaveButton();
        
        // Update header
        this.updateHeaderAvatar();
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

    updateHeaderAvatar() {
        // This will be called from other pages to update the header
        const meSection = document.getElementById('meSection');
        if (meSection && this.selectedAvatar) {
            const icon = meSection.querySelector('i');
            if (icon) {
                icon.className = this.selectedAvatar.icon;
                icon.style.color = this.selectedAvatar.color;
            }
        }
    }

    // Static method to get current avatar (for use in other pages)
    static getCurrentAvatar() {
        const savedAvatar = localStorage.getItem('cyberdefender_avatar');
        return savedAvatar ? JSON.parse(savedAvatar) : null;
    }

    // Static method to update header avatar (for use in other pages)
    static updateHeaderAvatar() {
        const avatar = CharacterSelector.getCurrentAvatar();
        const meSection = document.getElementById('meSection');
        
        if (meSection && avatar) {
            const icon = meSection.querySelector('i');
            if (icon) {
                icon.className = avatar.icon;
                icon.style.color = avatar.color;
            }
        }
    }

    // Method to add new avatars (for future use)
    addAvatar(avatar) {
        this.avatars.push(avatar);
        this.renderAvatars();
    }

    // Method to remove avatars (for future use)
    removeAvatar(avatarId) {
        this.avatars = this.avatars.filter(avatar => avatar.id !== avatarId);
        this.renderAvatars();
    }
}

// Initialize the character selector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CharacterSelector();
});

// Export for use in other scripts
window.CharacterSelector = CharacterSelector; 
import { auth, db, currentUserId, currentUserEmail } from './main.js';

document.addEventListener("DOMContentLoaded", function() {
  // Toggle Card Expansion
  const cards = document.querySelectorAll('.npc-card');

  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't toggle if the click was on a button
        this.classList.toggle('expanded');
    });
  });

  // Toggle Between Grid and List View - FIXED
  const viewToggle = document.getElementById('viewToggle');
  const npcsGrid = document.querySelector('.npcs_grid');

  // Check if elements exist before adding event listeners
  if (viewToggle && npcsGrid) {
    viewToggle.addEventListener('click', function() {
      // Apply the class to the grid itself, not its parent
      npcsGrid.classList.toggle('list_view'); // Changed from list_view to list-view
      
      if(npcsGrid.classList.contains('list_view')) {
        viewToggle.innerHTML = '<i class="fas fa-th-large"></i> Switch to Grid View';
      } else {
        viewToggle.innerHTML = '<i class="fas fa-list"></i> Switch to List View'; // Fixed icon class
      }
    });
  }

  // Simple Filter Functionality - IMPROVED
  const searchInput = document.getElementById('search');
  const locationFilter = document.getElementById('location');
  const roleFilter = document.getElementById('role');
  const alignmentFilter = document.getElementById('alignment');

  function filterNPCs(){
    // Check if filter elements exist
    if (!searchInput || !locationFilter || !roleFilter || !alignmentFilter) return;
    
    const searchText = searchInput.value.toLowerCase();
    const locationValue = locationFilter.value.toLowerCase();
    const roleValue = roleFilter.value.toLowerCase();
    const alignmentValue = alignmentFilter.value.toLowerCase();

    cards.forEach(card => {
      const name = card.querySelector('.npc_name').textContent.toLowerCase();
      const description = card.querySelector('.npc_description').textContent.toLowerCase();
      const tags = Array.from(card.querySelectorAll('.npc_tag')).map(tag => 
        tag.textContent.toLowerCase()
      );

      // Improved matching logic
      const matchesSearch = !searchText || 
                           name.includes(searchText) || 
                           description.includes(searchText);
      
      const matchesLocation = !locationValue || 
                             tags.some(tag => tag.includes(locationValue));
      
      const matchesRole = !roleValue || 
                         tags.some(tag => tag.includes(roleValue));
      
      const matchesAlignment = !alignmentValue || 
                              tags.some(tag => tag.includes(alignmentValue));

      // Show or hide card based on all filters
      if (matchesSearch && matchesLocation && matchesRole && matchesAlignment) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Add event listeners only if elements exist
  if (searchInput) searchInput.addEventListener('input', filterNPCs);
  if (locationFilter) locationFilter.addEventListener('change', filterNPCs);
  if (roleFilter) roleFilter.addEventListener('change', filterNPCs);
  if (alignmentFilter) alignmentFilter.addEventListener('change', filterNPCs);
});
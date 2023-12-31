const ToggleSwitch = (id, checked) => {
  return `
	<div class="report-card__toggle_button">
		<label class="switch">
			<input type="checkbox" id="ts-${id}" ${checked ? 'checked' : ''}>
			<span class="slider round"></span>
		</label>
		<span class="toggleStatus" class="text-body-3 medium ${
      checked ? 'text-success-500' : 'text-warning-700'
    }">${checked ? 'Ongoing' : 'Inactive'}</span>
	</div>
  	`;
};

export const onToggle = ({ target }) => {
  const toggleSwitch = target;
  const toggleElem = toggleSwitch.closest('.report-card__toggle_button');
  const toggleStatus = toggleElem.querySelector('.toggleStatus');

  if (toggleSwitch.checked) {
    toggleStatus.textContent = 'Ongoing';
    toggleStatus.style.color = 'var(--success-500, #10973D)';
  } else {
    toggleStatus.textContent = 'Inactive';
    toggleStatus.style.color = 'var(--neutral-400, #98A2B3)';
  }
};

export default ToggleSwitch;

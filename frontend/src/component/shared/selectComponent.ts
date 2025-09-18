import dom from "../../shared/dom.js";

// Reusable Generic Select Component using dom.create
function selectComponent<T>(
  dataId: string, 
  options: T[], 
  valueKey: keyof T, 
  labelKey: keyof T, 
  defaultOption: string = "Select an option"
): HTMLSelectElement {
  // Create the select element with default option
  const selectHTML = `
    <select data-id="${dataId}" class="w-full px-4 py-2 rounded-2xl bg-input border border-gray-700 text-primary">
      <option value="" class="text-secondary">${defaultOption}</option>
    </select>
  `;
  
  // Create the select element using dom.create
  const select = dom.create(selectHTML) as HTMLSelectElement;

  // Populate the select element with options
  options.forEach(optionData => {
    const option = document.createElement("option");
    option.value = String(optionData[valueKey]);  // Use valueKey for the option's value
    option.textContent = String(optionData[labelKey]);  // Use labelKey for the option's text
    select.appendChild(option);
  });

  return select;
}

export default selectComponent;

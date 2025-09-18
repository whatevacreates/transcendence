import dom from "../../shared/dom.js";
import User from "../../shared/interface/User.js";
import Router from "../../router.js";

// =============================================================================
// Component:
// =============================================================================

function avatarComponent(
  user: User,
  size: number = 64,
  options: { clickable?: boolean; online?: boolean; isFriend?: boolean } = {},
): HTMLElement {
  const { clickable = false, online = false, isFriend = false } = options;
  const src = `/api/user/avatar/${user.id}`;
  
  const borderColor = online ? "border-green-500" : "border-lightText";

  const image = dom.create(`
        <img 
          src="${src}" 
          alt="${user.username} Avatar" 
          style="width: ${size}px; height: ${size}px;" 
          class="rounded-full mx-auto object-cover border-2 ${borderColor} ${
    clickable ? "cursor-pointer hover:opacity-80" : ""
  }"
          ${clickable ? 'title="View Profile"' : ""}
        >
      `);

  if (clickable) {
    image.addEventListener("click", (event) => {
      event.stopPropagation();
      Router.goToProfile(user);
    });
  }

  if (isFriend) {
    const friendIcon = dom.create(`    
          <div class="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-2.209 0-4 1.791-4 4h8c0-2.209-1.791-4-4-4z" />
            </svg>
          </div>
        `);

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.appendChild(image);
    wrapper.appendChild(friendIcon);

    return wrapper;
  }
  return image;
}

export default avatarComponent;

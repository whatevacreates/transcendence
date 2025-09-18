import dom from '../../shared/dom.js';
import avatarComponent from '../profile/avatarComponent.js';
import api from "../../shared/api/api.js";

function scoreboardComponent(userIdA: number, 
                              userIdB: number,
                              userA: string,
                              userB: string, 
                              scoreA = 0, 
                              scoreB = 0) {
  const component = dom.create(`
  <div class="relative flex items-center justify-between w-full text-white py-4 px-4 min-h-[5rem]">
  <!-- Center divider (absolute, perfectly centered) -->
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[calc(-50%+7px)] h-[2.7rem] w-[4px] rounded-2xl bg-secondary"></div>



  <div class="flex items-center gap-3">
  <div data-id="avatar-player-a"></div>
    <div data-id="player-a" class="text-[1.3rem] font-bold font-headline">Loading...</div>
    
  </div>

  <!-- Scores placed next to the divider -->
  <div data-id="score-a"
       class="font-headline  font-lightText px-4 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+0.75rem)]
              text-[4rem]">
    ${scoreA}
  </div>

  <div data-id="score-b"
       class="text-[4rem] font-headline  font-lightText  px-4 absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[0.75rem]
              ">
    ${scoreB}
  </div>

  <!-- Right: mirrored group (nickname near divider, avatar at far right) -->
  <div class="flex items-center gap-3">
    <div data-id="player-b" class="text-[1.3rem] font-bold font-headline text-right">Loading...</div>
    <div data-id="avatar-player-b"></div>
  </div>
</div>

  `);

  // DOM elements
  const avatarA = component.querySelector('[data-id="avatar-player-a"]') as HTMLElement;
  const avatarB = component.querySelector('[data-id="avatar-player-b"]') as HTMLElement;
  const nameA = component.querySelector('[data-id="player-a"]') as HTMLElement;
  const nameB = component.querySelector('[data-id="player-b"]') as HTMLElement;
  const scoreAEl = component.querySelector('[data-id="score-a"]') as HTMLElement;
  const scoreBEl = component.querySelector('[data-id="score-b"]') as HTMLElement;

// Set names
nameA.innerText = userA;
nameB.innerText = userB;

if(nameB.innerText === "You are playing against AI")
  avatarB.classList.add("hidden")

// Set avatars
avatarA.appendChild(avatarComponent({ id: userIdA, username: userA }));
avatarB.appendChild(avatarComponent({ id: userIdB, username: userB }));

  // Update method
  const update = (newScores: { scoreA?: number; scoreB?: number }) => {
    if (newScores.scoreA !== undefined) {
      scoreAEl.innerText = newScores.scoreA.toString();
    }
    if (newScores.scoreB !== undefined) {
      scoreBEl.innerText = newScores.scoreB.toString();
    }
  };

  return {
    element: component,
    update
  };
}

export default scoreboardComponent;
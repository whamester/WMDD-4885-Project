class NotificationsEmpty {
  constructor() {}

  getHTML = () => {
    return `
        <div style="display:flex; flex-direction:column; gap:2rem; justify-content:center; align-items:center; padding-top:3rem; padding-bottom:3rem; ">
                <img src="../../assets/img/notifications-empty.svg" style="width:19.13rem; height: 12.15rem"/>

                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                        <h2 class="text-center" style="margin:0; padding:0;">No notifications</h2>
                        <p class="text-body-2 text-center" style="color:var(--neutral-600)">Go out and explore nature!<p>
                </div>
        </div>
        
        `;
  };
}

export default NotificationsEmpty;

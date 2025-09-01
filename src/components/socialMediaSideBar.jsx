import { MessageSquare, Linkedin, Github } from "lucide-react";

const SocialMediaSidebar = () => {
  const socialLinks = [
    {
      icon: MessageSquare,
      href: "https://discord.gg/yourserver",
      label: "Discord",
      color: "hover:bg-indigo-600",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/lankadata/",
      label: "LinkedIn",
      color: "hover:bg-blue-600",
    },
    {
      icon: Github,
      href: "https://github.com/LDFLK",
      label: "GitHub",
      color: "hover:bg-gray-800",
    },
  ];

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/1 z-50">
      <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-l-2xl shadow-lg border border-r-0 border-gray-200">
        {socialLinks.map((social, index) => {
          const IconComponent = social.icon;
          return (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 text-gray-600 transition-all duration-200 hover:text-white ${social.color} hover:scale-110 first:rounded-tl-2xl last:rounded-bl-2xl group`}
              title={social.label}
            >
              <IconComponent className="w-5 h-5" />

              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {social.label}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaSidebar;
import { Map, Mail, Phone, Globe, Clipboard } from "lucide-react";

const footerLinks: Record<string, string[]> = {
  Programmes: [
    "Foundational Leadership",
    "Academic Excellence",
    "School Ops & Finance",
    "The Capstone Project",
  ],
  Resources: [
    "Privacy Policy",
    "Terms of Service",
    "Accreditation",
    "Support Contact",
  ],
};

interface Contact {
  email: string;
  address: string;
  phone: string;
}

const contact: Contact = {
  email: "support@slan.ng",
  address: "Lagos & Abuja, Nigeria",
  phone: "+234 (0) 800-SLAN-EDU",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-neutral-200 text-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <p className="font-headline font-bold text-xl text-neutral-800 mb-3">
            SLAN Online
          </p>
          <p className="text-sm leading-relaxed text-neutral-800 mb-5">
            The professional development academy for serving and aspiring school
            leaders across Nigeria.
          </p>
          <div className="flex gap-3">
            {/* Globe icon */}
            <span className="w-8 h-8 rounded-full border border-none flex items-center justify-center hover:border-secondary-400 transition-colors cursor-pointer text-xs">
              <Globe size={20}/>
            </span>
            {/* Docs icon */}
            <span className="w-8 h-8 rounded-full border border-none flex items-center justify-center hover:border-secondary-400 transition-colors cursor-pointer text-xs">
              <Clipboard size={20}/>
            </span>
          </div>
        </div>

        {/* Link groups */}
        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h4 className="font-headline font-semibold text-sm text-neutral-800 mb-4 capitalize tracking-wider">
              {group}
            </h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-neutral-800 hover:text-secondary-500 transition-colors duration-150"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <h4 className="font-headline font-semibold text-sm text-neutral-800 mb-4 capitalize tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm text-neutral-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">
                <Mail size={15} />
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-secondary-500 transition-colors"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">
                <Map size={15} />
              </span>
              <span>{contact.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">
                <Phone size={15} />
              </span>
              <span>{contact.phone}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-neutral-800 text-center">
          © {currentYear} School Leadership Academy Nigeria (SLAN). Accredited
          by TRCN & ANCOPPS. Powered By TedPrime Academy.
        </div>
      </div>
    </footer>
  );
}

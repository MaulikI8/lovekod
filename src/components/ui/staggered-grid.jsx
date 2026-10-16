import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function StaggeredGrid({
  items = [],
  className,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  cardClassName,
  ...props
}) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn("grid gap-5 w-full", columns, className)}
      {...props}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id ?? index}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden p-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm transition-colors hover:border-[var(--rose-gold)]",
              cardClassName,
              item.className
            )}
          >
            <div>
              {item.badge && (
                <span className="inline-block px-2.5 py-0.5 mb-3 text-xs font-semibold rounded bg-[var(--blush)] text-[var(--rose-gold)]">
                  {item.badge}
                </span>
              )}

              <div className="flex items-center gap-3 mb-2">
                {Icon && (
                  <div className="flex items-center justify-center size-9 rounded border border-[var(--line)] bg-[var(--paper)] text-[var(--rose-gold)] group-hover:bg-[var(--rose-gold)] group-hover:text-[var(--paper)] transition-colors">
                    <Icon size={18} />
                  </div>
                )}
                <h3 className="font-serif text-xl font-semibold leading-tight text-[var(--ink)]">
                  {item.title}
                </h3>
              </div>

              {item.subtitle && (
                <p className="text-xs font-medium uppercase tracking-wider text-[#704237] mb-2">
                  {item.subtitle}
                </p>
              )}

              <p className="text-sm leading-relaxed text-[var(--ink)] opacity-90">
                {item.description}
              </p>
            </div>

            {item.footer && (
              <div className="mt-4 pt-3 border-t border-[var(--line)] text-xs text-[#6B4E46]">
                {item.footer}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default StaggeredGrid;

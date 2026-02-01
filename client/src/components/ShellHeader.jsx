import { motion } from "framer-motion";

export default function ShellHeader({ shellName }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-header text-white py-4 text-center text-lg font-semibold shadow-sm"
    >
      {shellName}
    </motion.header>
  );
}
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";

const techStack = [
    {
        name: "PostgreSQL",
        logo: "/logos/postgresql.png",
        desc: "Relational database",
    },
    {
        name: "Prisma",
        logo: "/logos/prisma.png",
        desc: "Database ORM",
    },
    {
        name: "Node.js",
        logo: "/logos/nodejs.png",
        desc: "Backend runtime",
    },
    {
        name: "React",
        logo: "/logos/react.png",
        desc: "Frontend library",
    },
    {
        name: "Cohere",
        logo: "/logos/cohere.png",
        desc: "Embeddings",
    },
    {
        name: "Groq",
        logo: "/logos/groq.png",
        desc: "Fast inference",
    },
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#1a1a1a] text-[#e8e8e8]">
            {/* ---------------- Navbar ---------------- */}
            <nav className="sticky top-0 z-50 bg-[#1a1a1a]/90 border-b border-white/10 backdrop-blur">
                <div className="max-w-8xl mx-auto h-20 px-20 flex items-center justify-between ">
                    <div className="flex items-center">
                        <img src="/logos/logo.png" className="w-20 h-20 text-white" />
                        <div className="">
                            <p className="text-lg font-semibold text-white">
                                Synapse
                            </p>
                            <p className="text-xs text-[#a8a8a8] mb-1">
                                PDF Assistant
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm text-[#cfcfcf] font-medium hover:text-white transition"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-[#0d9488] hover:bg-[#0f766e] transition px-5 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>


            {/* ---------------- Hero ---------------- */}
            <section className="relative overflow-hidden">
                {/* background glow */}
                <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#0d9488]/10 blur-[140px]" />
                <div className="relative max-w-[1600px] mx-auto px-10 py-24">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center mx-12">
                        {/* Left Side */}
                        <div>
                            <p className="uppercase tracking-[0.35em] text-xs text-[#0d9488] font-semibold">
                                Synapse
                            </p>

                            <h1 className="mt-8 text-5xl lg:text-[4rem] font-bold leading-tight text-white">
                                Your documents
                                <br />
                                Your questions
                                <span className="block text-[#0d9488] mt-2">
                                    Instant answers.
                                </span>
                            </h1>

                            <p className="mt-7 text-md leading-8 text-[#a8a8a8] max-w-xl">
                                Upload PDFs and ask questions in plain English. Every answer includes the source so you can verify it.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link
                                    to="/register"
                                    className="bg-[#0d9488] hover:bg-[#0f766e] transition rounded-xl px-6 py-2.5 text-white font-medium flex items-center gap-2 shadow-lg shadow-[#0d9488]/20"
                                >
                                    Get Started
                                    <ArrowRight size={18} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="border border-white/10 hover:bg-white/5 transition rounded-xl px-6 py-2.5 text-[#d6d6d6]"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="relative flex justify-end">
                            {/* Glow */}
                            <div className="absolute inset-0 bg-[#0d9488]/20 blur-[100px] rounded-full scale-90" />
                            {/* Browser Frame */}
                            <div className="relative w-full max-w-[850px] mt-6 rounded-3xl border border-white/10 bg-[#212121] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] shadow-2xl">
                                {/* Browser Top */}
                                <div className="flex items-center gap-2 px-2 pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>

                                {/* Dashboard */}
                                <img
                                    src="/landingPage.png"
                                    alt="Dashboard"
                                    className="w-full rounded-2xl bg-[#202020] border border-white/10 "
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* divider - horizontal line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2dd4bf]/20 to-transparent" />

            {/* ---------------- Built With ---------------- */}
            <section>
                <div className="max-w-[1400px] mx-auto px-8 py-24">
                    <div className="text-center">
                        <p className="text-[#0d9488] text-sm font-medium uppercase tracking-[0.3em]">
                            Built With
                        </p>
                        <h2 className="text-4xl font-bold mt-4 text-white">
                            Technologies Used
                        </h2>
                        <p className="text-[#9d9d9d] mt-4">
                            Simple tools that work well together.
                        </p>

                    </div>

                    <div className="mt-16 flex justify-center gap-4 flex-wrap lg:flex-nowrap">
                        {techStack.map((item) => (
                            <div
                                key={item.name}
                                className="group w-[230px] h-[220px] rounded-2xl border border-[#353535] bg-[#1f1f1f] hover:border-[#454545] hover:bg-[#222222] transition-all duration-300 flex flex-col items-center justify-center text-center px-6"
                            >
                                <img
                                    src={item.logo}
                                    alt={item.name}
                                    className="w-14 h-14 object-contain mb-5 transition-transform duration-300 group-hover:scale-105"
                                />

                                <h3 className="text-2xl font-semibold text-white">
                                    {item.name}
                                </h3>

                                <p className="mt-3 text-base text-[#a0a0a0]">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- Footer ---------------- */}
            <footer className="border-t border-[#383838] bg-[#1a1a1a]">
                <div className="max-w-7xl mx-auto px-8 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left */}
                        <div className="flex items-center">
                            <img src="/logos/logo.png" className="w-16 h-16 text-white" />
                            <div className="">
                                <p className="text-lg font-semibold text-white">
                                    Synapse
                                </p>
                                <p className="text-xs text-[#a8a8a8] mb-2">
                                    Ask questions from your PDFs.
                                </p>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-8">
                            {/* <a
                                href="https://github.com/mantosh7/Synapse-Project"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#cfcfcf] hover:text-white transition"
                            >
                                <div className="flex gap-2">
                                    <img src="/logos/github.png" alt="GitHub"
                                        className="w-8 h-8" />
                                    <div className="mt-1">GitHub</div>
                                </div>
                            </a> */}
                            <p className="text-sm text-[#a8a8a8]">
                                © 2026 Synapse
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
export default Landing;
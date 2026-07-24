import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
    const nvg = useNavigate();
    
    // Trình tạo số ngẫu nhiên an toàn để tránh cảnh báo pseudorandom của SonarQube
    const getSecureRandom = () => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
    };

    // Tạo mảng các ngôi sao lấp lánh (particle effect)
    const stars = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        top: getSecureRandom() * 100 + '%',
        left: getSecureRandom() * 100 + '%',
        size: getSecureRandom() * 3 + 1,
        duration: getSecureRandom() * 3 + 2,
        delay: getSecureRandom() * 2
    }));

    return (
        <div className="relative flex flex-col md:flex-row items-center justify-center min-h-screen overflow-hidden p-8" style={{ fontFamily: "'DM Sans', sans-serif", background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)" }}>
            
            {/* Hạt sao lấp lánh */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {stars.map(star => (
                    <motion.div
                        key={star.id}
                        className="absolute rounded-full bg-white"
                        style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                        animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.5, 1] }}
                        transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            {/* Nội dung text bên trái */}
            <div className="md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-12 z-10 text-center md:text-left mb-12 md:mb-0">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-md backdrop-blur-sm bg-white/5 p-10 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <h1 
                            className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-2" 
                            style={{ fontFamily: "'Playfair Display', serif", filter: "drop-shadow(0 0 30px rgba(96, 165, 250, 0.5))" }}
                        >
                            404
                        </h1>
                    </motion.div>
                    
                    <h2 className="text-3xl font-semibold text-white mb-4">Lạc đường rồi!</h2>
                    
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời. Xin vui lòng quay lại trang chủ.
                    </p>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button
                            className="md:mx-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 border-none font-bold h-14 px-8 text-white text-lg rounded-xl flex items-center justify-center w-full md:w-auto"
                            onClick={() => nvg('/')}
                        >
                            <Home className="w-5 h-5 mr-2" /> Về trang chủ
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* SVG Illustration bên phải */}
            <motion.div 
                className="md:w-1/2 w-full max-w-lg relative z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [-1, 1, -1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg
                    className="w-full h-auto drop-shadow-2xl"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="51.5 -15.288 385 505.565"
                >
                    <g fill="#5b7c9b">
                        <path
                            d="M202.778,391.666h11.111v98.611h-11.111V391.666z M370.833,390.277h11.111v100h-11.111V390.277z M183.333,456.944h11.111
            v33.333h-11.111V456.944z M393.056,456.944h11.111v33.333h-11.111V456.944z"
                        />
                    </g>

                    <g fill="#446182">
                        <path
                            d="M396.527,397.917c0,1.534-1.243,2.777-2.777,2.777H190.972c-1.534,0-2.778-1.243-2.778-2.777v-8.333
            c0-1.535,1.244-2.778,2.778-2.778H393.75c1.534,0,2.777,1.243,2.777,2.778V397.917z M400.694,414.583
            c0,1.534-1.243,2.778-2.777,2.778H188.194c-1.534,0-2.778-1.244-2.778-2.778v-8.333c0-1.534,1.244-2.777,2.778-2.777h209.723
            c1.534,0,2.777,1.243,2.777,2.777V414.583z M403.473,431.25c0,1.534-1.244,2.777-2.778,2.777H184.028
            c-1.534,0-2.778-1.243-2.778-2.777v-8.333c0-1.534,1.244-2.778,2.778-2.778h216.667c1.534,0,2.778,1.244,2.778,2.778V431.25z"
                        />
                    </g>

                    <g fill="#2d4059">
                        <path
                            d="M417.361,459.027c0,0.769-1.244,1.39-2.778,1.39H170.139c-1.533,0-2.777-0.621-2.777-1.39v-4.86
            c0-0.769,1.244-0.694,2.777-0.694h244.444c1.534,0,2.778-0.074,2.778,0.694V459.027z"
                        />
                        <path d="M185.417,443.75H400c0,0,18.143,9.721,17.361,10.417l-250-0.696C167.303,451.65,185.417,443.75,185.417,443.75z" />
                    </g>

                    <g id="lamp">
                        <path
                            fill="#1e2a3b"
                            d="M125.694,421.997c0,1.257-0.73,3.697-1.633,3.697H113.44c-0.903,0-1.633-2.44-1.633-3.697V84.917
              c0-1.257,0.73-2.278,1.633-2.278h10.621c0.903,0,1.633,1.02,1.633,2.278V421.997z"
                        />
                        <path
                            fill="#3f5a7a"
                            d="M128.472,93.75c0,1.534-1.244,2.778-2.778,2.778h-13.889c-1.534,0-2.778-1.244-2.778-2.778V79.861
              c0-1.534,1.244-2.778,2.778-2.778h13.889c1.534,0,2.778,1.244,2.778,2.778V93.75z"
                        />
                        <circle
                            fill="#f39c12"
                            cx="119.676"
                            cy="44.22"
                            r="40.51"
                        />
                        <path
                            fill="#1e2a3b"
                            d="M149.306,71.528c0,3.242-13.37,13.889-29.861,13.889S89.583,75.232,89.583,71.528c0-4.166,13.369-13.889,29.861-13.889
              S149.306,67.362,149.306,71.528z"
                        />
                        <radialGradient
                            id="SVGID_1_"
                            cx="119.676"
                            cy="44.22"
                            r="65"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop
                                offset="0%"
                                style={{
                                    stopColor: '#f1c40f',
                                    stopOpacity: 1,
                                }}
                            />
                            <stop
                                offset="50%"
                                style={{
                                    stopColor: '#f1c40f',
                                    stopOpacity: 0.5,
                                }}
                            />
                            <stop
                                offset="100%"
                                style={{
                                    stopColor: '#f1c40f',
                                    stopOpacity: 0,
                                }}
                            />
                        </radialGradient>
                        <circle
                            fill="url(#SVGID_1_)"
                            cx="119.676"
                            cy="44.22"
                            r="65"
                            className="animate-pulse"
                        />
                        <path
                            fill="#1e2a3b"
                            d="M135.417,487.781c0,1.378-1.244,2.496-2.778,2.496H106.25c-1.534,0-2.778-1.118-2.778-2.496v-74.869
              c0-1.378,1.244-2.495,2.778-2.495h26.389c1.534,0,2.778,1.117,2.778,2.495V487.781z"
                        />
                    </g>
                </svg>
                </motion.div>
            </motion.div>
        </div>
    );
};

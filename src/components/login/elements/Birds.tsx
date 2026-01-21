import React from 'react';

export const Birds = () => {
    return (
        <div className="absolute top-[20%] left-0 w-full h-[20%] pointer-events-none z-10 animate-birds-fly">
            <svg viewBox="0 0 1000 200" className="w-full h-full opacity-60" fill="currentColor">
                <g className="text-neutral-400">
                    {/* Bird 1 - Gliding */}
                    <path d="M800 60 C 805 58 815 58 820 60 L 830 55 C 840 50 850 50 860 55 L 855 58 C 850 56 840 56 835 60 L 820 65 C 815 67 805 67 800 65 L 790 60 C 780 55 770 55 760 60 L 765 57 C 775 52 785 52 795 58 Z" />

                    {/* Bird 2 - Flapping Up */}
                    <path d="M880 40 C 885 30 895 30 900 40 L 910 35 C 920 25 930 25 940 35 L 935 38 C 930 30 920 30 915 38 L 900 45 C 895 50 885 50 880 45 L 870 38 C 860 30 850 30 840 38 L 845 35 C 855 25 865 25 875 35 Z" />

                    {/* Bird 3 - Banking */}
                    <path d="M750 90 C 752 92 755 92 757 90 L 760 95 C 765 98 770 98 775 95 L 772 92 C 768 94 764 94 760 92 L 755 88 C 752 86 748 86 745 88 L 740 92 C 735 96 730 96 725 92 L 728 90 C 732 94 736 94 740 90 Z" />

                    {/* Bird 4 - Small Far */}
                    <path d="M950 100 C 952 98 958 98 960 100 L 965 98 C 970 95 975 95 980 98 L 978 99 C 975 97 970 97 968 99 L 960 102 C 958 103 952 103 950 102 L 945 99 C 940 97 935 97 930 99 L 932 98 C 938 95 942 95 948 98 Z" />
                </g>
            </svg>
        </div>
    );
};

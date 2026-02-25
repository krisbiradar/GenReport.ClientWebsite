// components/Navbar.tsx
'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavbarState } from '../../state-management/slices/menu-impl-slice';
import { setAccess, showShadowScreen, hideShadowScreen } from '../../state-management/slices/menu-impl-slice';
import Constants from '@/utils/static/constants';
import { container } from '@/utils/di/inversify.config';
import DefaultStore from '@/state-management/store/app-store';
export default function Navbar(): React.JSX.Element {
    const store = container.get(DefaultStore);
    const dispatch = useDispatch();
    const pathname = usePathname();


    const { menuItems, access, loading, error, shadowScreenVisible } = useSelector(
        (state: NavbarState) => state
    );

    useEffect(() => {
        const hasAccess = !Constants.excludeNavBar.includes(pathname);
        dispatch(setAccess(hasAccess));

    }, [pathname, dispatch]);

    if (!access) return <></>;

    const handleMenuOpen = () => dispatch(showShadowScreen());
    const handleMenuClose = () => dispatch(hideShadowScreen());

    return (
        <>
            {/* Shadow Screen */}
            {shadowScreenVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleMenuClose} // Close when clicking outside
                ></div>
            )}

            {/* Navbar */}
            <nav className="bg-black text-white relative z-50 shadow-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <div className="text-2xl font-bold">GENREPORT</div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ul className="flex space-x-6">
                            {menuItems.map((item) =>
                                item.children ? (
                                    <li
                                        key={item.id}
                                        className="relative group"
                                        onMouseEnter={handleMenuOpen}
                                        onMouseLeave={handleMenuClose}
                                    >
                                        <button className="hover:text-blue-400">
                                            {item.label}
                                        </button>
                                        <ul className="absolute hidden group-hover:block bg-gray-800 p-2 rounded shadow-lg z-50">
                                            {item.children.map((child) => (
                                                <li key={child.id}>
                                                    <a
                                                        href={child.link}
                                                        className="block px-4 py-2 hover:bg-gray-700"
                                                    >
                                                        {child.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ) : (
                                    <li key={item.id}>
                                        <a
                                            href={item.link}
                                            className="hover:text-blue-400"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    )}
                </div>
            </nav>
        </>
    );
}

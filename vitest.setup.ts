import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// next/font só existe no build do Next; nos testes qualquer fonte vira classes vazias.
const font = () => ({ className: "", variable: "" });
vi.mock("next/font/google", () => ({ Caveat: font, Inter: font, Saira_Stencil: font }));

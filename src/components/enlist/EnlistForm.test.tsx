import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const action = vi.hoisted(() => ({ enlist: vi.fn() }));
vi.mock("@/app/servidor/actions", () => action);

const { EnlistForm } = await import("./EnlistForm");

async function fillAll(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nick do Minecraft"), "Kai_D3v");
  await user.type(screen.getByLabelText("E-mail"), "recruta@example.com");
  await user.type(screen.getByLabelText("WhatsApp (opcional)"), "11987654321");
  await user.click(screen.getByRole("button", { name: "Próximo" }));
  await user.click(screen.getByRole("radio", { name: /wardens/i }));
  await user.click(screen.getByRole("button", { name: "Próximo" }));
  await user.click(screen.getByRole("radio", { name: "Veterano de guerra de facções" }));
  await user.click(screen.getByRole("radio", { name: "Sul" }));
  await user.click(screen.getByRole("radio", { name: "Noite" }));
  await user.click(screen.getByRole("button", { name: "Próximo" }));
  await user.click(screen.getByRole("checkbox"));
}

describe("EnlistForm", () => {
  beforeEach(() => action.enlist.mockReset());

  it("does not advance past a step with errors", async () => {
    const user = userEvent.setup();
    render(<EnlistForm />);
    await user.type(screen.getByLabelText("Nick do Minecraft"), "a");
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText(/3 a 16 letras/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Identificação" })).toBeInTheDocument();
  });

  it("walks the 4 steps, sends the form and shows the stamped card", async () => {
    action.enlist.mockResolvedValue({ ok: true, number: 7, code: "abc", updated: false });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    expect(screen.getByText(/e pelo WhatsApp/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Assinar e alistar" }));
    expect(action.enlist).toHaveBeenCalledWith(
      expect.objectContaining({ nick: "Kai_D3v", side: "wardens", consent: true }),
    );
    expect(await screen.findByText("Ficha nº 7")).toBeInTheDocument();
    expect(screen.getByText("ALISTADO")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cartão de alistamento/ })).toHaveAttribute("href", "/servidor/ficha/abc");
  });

  it("goes back to the step of a server-side error", async () => {
    action.enlist.mockResolvedValue({ ok: false, errors: { nick: "Esse nick já está alistado com outro e-mail." } });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    await user.click(screen.getByRole("button", { name: "Assinar e alistar" }));
    expect(await screen.findByText(/já está alistado/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Identificação" })).toBeInTheDocument();
  });

  it("shows the message when enlistment is closed", async () => {
    action.enlist.mockResolvedValue({ ok: false, message: "O alistamento ainda não está aberto." });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    await user.click(screen.getByRole("button", { name: "Assinar e alistar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/ainda não está aberto/);
  });
});

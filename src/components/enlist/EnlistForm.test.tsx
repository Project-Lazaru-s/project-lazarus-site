import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const action = vi.hoisted(() => ({ enlist: vi.fn() }));
vi.mock("@/app/servidor/actions", () => action);

const { EnlistForm } = await import("./EnlistForm");

const tuneTo = (freq: number) =>
  fireEvent.change(screen.getByRole("slider", { name: "Frequência" }), { target: { value: freq } });

async function fillAll(user: ReturnType<typeof userEvent.setup>) {
  tuneTo(104.1);
  await user.click(screen.getByRole("button", { name: "Responder ao chamado da 104.1" }));
  await user.type(screen.getByLabelText(/Nick do Minecraft/), "Kai_D3v");
  await user.type(screen.getByLabelText("E-mail para a convocação"), "recruta@example.com");
  await user.type(screen.getByLabelText("WhatsApp (opcional)"), "11987654321");
  await user.click(screen.getByRole("button", { name: "Próximo" }));
  await user.click(screen.getByRole("radio", { name: "Veterano de guerra de facções" }));
  await user.click(screen.getByRole("radio", { name: "Sul" }));
  await user.click(screen.getByRole("radio", { name: "Noite" }));
  await user.click(screen.getByRole("button", { name: "Próximo" }));
  await user.click(screen.getByRole("checkbox"));
}

describe("EnlistForm", () => {
  beforeEach(() => {
    action.enlist.mockReset();
    localStorage.setItem("lazarus:lore:sound", "0");
  });

  it("starts on the radio: the faction call is static until the dial gets close", () => {
    render(<EnlistForm />);
    expect(screen.queryByRole("button", { name: /responder ao chamado/i })).not.toBeInTheDocument();
    tuneTo(87.3);
    expect(screen.getByText(/A farda acabou/)).toBeInTheDocument();
    expect(screen.getByText("Sinais encontrados: 1/3")).toBeInTheDocument();
  });

  it("lets the lone wolf skip the radio", async () => {
    const user = userEvent.setup();
    render(<EnlistForm />);
    await user.click(screen.getByRole("button", { name: "Seguir como lobo solitário" }));
    expect(screen.getByText("Lobo solitário")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Indicativo" })).toBeInTheDocument();
  });

  it("does not advance past a step with errors", async () => {
    const user = userEvent.setup();
    render(<EnlistForm />);
    await user.click(screen.getByRole("button", { name: "Seguir como lobo solitário" }));
    await user.type(screen.getByLabelText(/Nick do Minecraft/), "a");
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText(/3 a 16 letras/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Indicativo" })).toBeInTheDocument();
  });

  it("answers a call, sends the form and shows the convocation letter with the reserved nick", async () => {
    action.enlist.mockResolvedValue({ ok: true, number: 7, code: "abc", updated: false });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    expect(screen.getByText(/e pelo WhatsApp/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Transmitir e alistar" }));
    expect(action.enlist).toHaveBeenCalledWith(
      expect.objectContaining({ nick: "Kai_D3v", side: "f1041", consent: true }),
    );
    expect(await screen.findByText(/Recruta nº 7/)).toBeInTheDocument();
    expect(screen.getByText("ALISTADO")).toBeInTheDocument();
    expect(screen.getByText(/O nick Kai_D3v está reservado/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /compartilhar a carta/ })).toHaveAttribute("href", "/servidor/ficha/abc");
  });

  it("goes back to the step of a server-side error", async () => {
    action.enlist.mockResolvedValue({ ok: false, errors: { nick: "Esse nick já está alistado com outro e-mail." } });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    await user.click(screen.getByRole("button", { name: "Transmitir e alistar" }));
    expect(await screen.findByText(/já está alistado/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Indicativo" })).toBeInTheDocument();
  });

  it("shows the message when enlistment is closed", async () => {
    action.enlist.mockResolvedValue({ ok: false, message: "O alistamento ainda não está aberto." });
    const user = userEvent.setup();
    render(<EnlistForm />);
    await fillAll(user);
    await user.click(screen.getByRole("button", { name: "Transmitir e alistar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/ainda não está aberto/);
  });
});

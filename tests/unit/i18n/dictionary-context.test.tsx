import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DictionaryProvider,
  useDictionary,
} from "@/i18n/dictionary-context";
import { dictionaries } from "@/i18n/dictionaries";

function Probe() {
  const dict = useDictionary();
  return <p data-testid="label">{dict.nav.home}</p>;
}

describe("useDictionary", () => {
  it("returns the english dictionary when no provider is present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Probe />);
    expect(screen.getByTestId("label")).toHaveTextContent(
      dictionaries.en.nav.home,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns the provided dictionary inside DictionaryProvider", () => {
    render(
      <DictionaryProvider dictionary={dictionaries.fr}>
        <Probe />
      </DictionaryProvider>,
    );
    expect(screen.getByTestId("label")).toHaveTextContent(
      dictionaries.fr.nav.home,
    );
  });
});

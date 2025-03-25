import { debounce } from "./debounce.utils";

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should debounce a function", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);
    debouncedFn();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalled();
  });

  it("should only call the function once after multiple rapid calls", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should pass arguments to the debounced function", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("test", 123);
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("test", 123);
  });

  it("should use the most recent arguments when multiple calls are made", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("should maintain the correct 'this' context", () => {
    const context = {
      value: "test",
      method: debounce(function (this: { value: string }) {
        expect(this.value).toBe("test");
      }, 100),
    };

    // Bind the correct context
    context.method = context.method.bind(context);

    context.method();
    jest.advanceTimersByTime(100);
  });
});

import { searchCommand } from '../../../src/commands/search';

describe('Search Command', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should show error when no query provided', async () => {
    try {
      await searchCommand('');
    } catch {
      // Expected exit
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Please specify a search query')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should show usage when no query', async () => {
    try {
      await searchCommand('');
    } catch {
      // Expected exit
    }

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: matimo search'));
  });

  it('should search packages by name', async () => {
    await searchCommand('slack');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('slack'));
  });

  it('should search packages by description', async () => {
    await searchCommand('workspace');

    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should display search results', async () => {
    await searchCommand('slack');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Search results'));
  });

  it('should show available packages when no match found', async () => {
    await searchCommand('nonexistent-tool-xyz-123');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('No packages found'));
  });

  it('should show tool count for each result', async () => {
    await searchCommand('slack');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Tools:'));
  });

  it('should display install instruction for each result', async () => {
    await searchCommand('slack');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('matimo install'));
  });

  it('should show total results count', async () => {
    await searchCommand('gmail');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Total:'));
  });

  it('should handle query case-insensitively', async () => {
    await searchCommand('SLACK');

    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('@matimo/slack'));
  });
});

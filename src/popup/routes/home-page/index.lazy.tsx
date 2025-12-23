import { ReactElement, useCallback, useEffect, useState } from 'react';

import { useSnackbar } from 'notistack';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { createLazyFileRoute } from '@tanstack/react-router';

import PopupContent from '@/popup/modules/core/components/PopupContent/PopupContent';
import PopupHeader from '@/popup/modules/core/components/PopupHeader/PopupHeader';

function HomePage(): ReactElement {
    const { enqueueSnackbar } = useSnackbar();

    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [isMediumPage, setIsMediumPage] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const MEDIUM_DOMAINS = [
        'medium.com',
        'hackernoon.com',
        'towardsdatascience.com',
        'betterprogramming.pub',
        'bettermarketing.pub',
        'betterhumans.pub',
        'psiloveyou.xyz',
        'writingcooperative.com',
        'uxdesign.cc',
        'levelup.gitconnected.com',
        'aninjusticemag.com',
        'datadriveninvestor.com',
        'startup.grind.com',
        'the-ascent.pub',
        'codeburst.io',
        'infosecwriteups.com',
        'plainenglish.io'
    ];

    const isMediumUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return MEDIUM_DOMAINS.some(
                domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
            );
        } catch {
            return false;
        }
    };

    const convertToFreediumUrl = (mediumUrl: string): string => {
        try {
            const urlObj = new URL(mediumUrl);
            if (
                urlObj.hostname.includes('medium.com') ||
                MEDIUM_DOMAINS.some(domain => urlObj.hostname.includes(domain))
            ) {
                return `https://freedium.cfd/${urlObj.pathname}${urlObj.search}`;
            }
            return mediumUrl;
        } catch {
            return mediumUrl;
        }
    };

    const openInFreedium = useCallback(async () => {
        if (!currentUrl || !isMediumPage) return;

        setIsLoading(true);
        try {
            const freediumUrl = convertToFreediumUrl(currentUrl);
            await chrome.tabs.create({ url: freediumUrl });
            enqueueSnackbar('Đã mở bài viết trên Freedium!', { variant: 'success' });
        } catch (e) {
            console.error(e);
            enqueueSnackbar('Không thể mở Freedium. Vui lòng thử lại.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [currentUrl, isMediumPage, enqueueSnackbar]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            const activeTab = tabs[0];
            if (activeTab?.url) {
                setCurrentUrl(activeTab.url);
                setIsMediumPage(isMediumUrl(activeTab.url));
            }
        });
    }, []);

    return (
        <>
            <PopupHeader />
            <PopupContent>
                <Stack alignItems="center" spacing={2} sx={{ minWidth: 300 }}>
                    <Box alignItems="center" textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Medium to Freedium
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Đọc miễn phí bài viết Medium
                        </Typography>
                    </Box>

                    {isMediumPage ? (
                        <>
                            <Typography variant="body2" color="success.main" textAlign="center">
                                Trang Medium được phát hiện!
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={isLoading}
                                onClick={openInFreedium}
                                startIcon={<OpenInNewIcon />}
                                fullWidth
                            >
                                Mở trong Freedium
                            </Button>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Trang hiện tại không phải là Medium.
                            <br />
                            Truy cập trang Medium để sử dụng extension.
                        </Typography>
                    )}

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mt: 2 }}
                    >
                        💡 Mẹo: Click chuột phải vào link Medium để mở trong Freedium
                    </Typography>
                </Stack>
            </PopupContent>
        </>
    );
}

export const Route = createLazyFileRoute('/home-page/')({
    component: HomePage
});
